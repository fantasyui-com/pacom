// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const kebabCase = require('lodash/kebabCase');

const fs = require('fs');
const path = require('path');

const chokidar = require('chokidar');

const markdown = require( "markdown" ).markdown;

var XRegExp = require('xregexp');


const NotificationCenter = require('node-notifier').NotificationCenter;
var notifier = new NotificationCenter({
  withFallback: true, // Use Growl Fallback if <= 10.8
});

////////////////////////////////////////////////////////////////////////////////

const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

////////////////////////////////////////////////////////////////////////////////

const sessionObject = {

  id: 'session',
  cursor: 'home',

  title: 'Home',
  text: '',
  code: '',

};

const stateObject = {

  id: 'state',

};

////////////////////////////////////////////////////////////////////////////////

var standardObserver = {
  get: function(object, propertyName) {
    return object[propertyName];
  },
  set: function(object, propertyName, newValue) {
    const objectId = object.id
    const oldValue = object[propertyName];
    object[propertyName] = newValue;
    myEmitter.emit([objectId, propertyName].join('.'), { objectId, propertyName, oldValue, newValue, });
  },
};

////////////////////////////////////////////////////////////////////////////////

/*
  assigning data to session/state will result in UI updates
  data must be assigned via writing to files.
*/

var system = {
  session: new Proxy(sessionObject, standardObserver),
  state: new Proxy(stateObject  , standardObserver),
};

////////////////////////////////////////////////////////////////////////////////


myEmitter.on('session.title', ({ objectId, propertyName, oldValue, newValue }) => {
  $(`title`).text(newValue);
});

myEmitter.on('session.cursor', ({ objectId, propertyName, oldValue, newValue }) => {
  processDataFile(`./db/${newValue}.md`)
});

myEmitter.on('session.text', ({ objectId, propertyName, oldValue, newValue }) => {
  let html = newValue.split(/\n/g).map(i=>`<div>${i}</div>`).join("");
  $(`.body`).html(html);

  $('.body .action').on('click', function() {
    system.session.cursor = $(this).data('event');
  });

});

myEmitter.on('session.code', ({ objectId, propertyName, oldValue, newValue }) => {
   $(`.code`).val(newValue);
   $(`.save-code`).off().on('click', function(){
     fs.writeFileSync( `./db/${system.session.cursor}.md`, $(`.code`).val() );
   });
});

////////////////////////////////////////////////////////////////////////////////

var watcher = chokidar.watch('db', {
  ignored: /(^|[\/\\])\../,
  persistent: true
});

// Something to use when events are received.
function validLink(target){
  console.log(target);
  const extname = path.extname(target);
  const basename = path.basename(target, extname);
  return !!fs.existsSync(`./db/${basename}.md`);
}

function processDataFile(target){

  const extname = path.extname(target);

  if(extname !== '.md') return;

  const basename = path.basename(target, extname);

  if(basename != system.session.cursor) return;

  if(!fs.existsSync(`./db/${basename}.md`)){
    fs.writeFileSync(`./db/${basename}.md`,['Clear Screen', 'Create action link: Home'].join("\n\n") );
    fs.writeFileSync(`./db/${basename}.js`,`module.exports = function({statements}){ require(__dirname+'/home.js')({statements}) }`)
  }

  const processor = require(`./db/${basename}.js`);
  const story = fs.readFileSync(target).toString();


  system.session.code = story;

  const statements = [];

  processor({statements});

  story.split(/\n/).forEach((line)=>{

    let matchedAtleastOnce = false;

    statements.forEach(function(statement){
      const match = XRegExp.exec(line, XRegExp(statement.pattern) );
      if(match) {
        matchedAtleastOnce = true;
        const directive = Object.assign({operation: 'apply'}, statement.base, match)

        // Defauts
        let val = `<p>${directive.newValue}</p>`;

        // Overloads
        if(directive.type === 'html/href' ){
          val = `<a class="action d-block" href="#" data-event="${kebabCase(directive.newValue)}"><u>${directive.newValue}</u></a>`;
        } else if(directive.type === 'text/md'){
          val = markdown.toHTML( directive.newValue );
          val = val.replace(/<img alt/g,'<img class="mw-100" alt')
        } else if(directive.type === 'text/plain'){
          val = directive.newValue;
        }

        // Assignment
        if(directive.operation == 'append') {
          system[directive.objectId][directive.propertyName] += val;
        }else{
          system[directive.objectId][directive.propertyName] = val
        }

      }
    });

    if(!matchedAtleastOnce && line.trim().length){
      system.session.text += `<p>${line}</p>`;
    }

  });

}

// Will be called initially to add files from db
watcher.on('add', function(path){
  processDataFile(path)
});

// will be called on changes
watcher.on('change', function(path){
  processDataFile(path)
});

////////////////////////////////////////////////////////////////////////////////
