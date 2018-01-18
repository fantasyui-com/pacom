// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const NotificationCenter = require('node-notifier').NotificationCenter;
var notifier = new NotificationCenter({
  withFallback: true, // Use Growl Fallback if <= 10.8
});


const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();



var objects = {

  screens: {
    id: 'screens',
    visibleScreen: 'main',
    orderProgress: 0,
    screenResultMessage: 'Success. You have been reassigned to other duties.'
  }

};


myEmitter.on('screens.visibleScreen', ({ objectId, propertyName, oldValue, newValue }) => {
  console.log('an event occurred!', objectId, propertyName, oldValue, newValue);

  //if( property.match(/Visibility$/) ) object.properties.forEach( property => object[property] = !value );
  $(`*.screen`).addClass('d-none');
  $(`*.screen.${newValue}`).removeClass('d-none');

});

myEmitter.on('screens.orderProgress', ({ objectId, propertyName, oldValue, newValue }) => {
  console.log('an event occurred!', objectId, propertyName, oldValue, newValue);

  //if( property.match(/Visibility$/) ) object.properties.forEach( property => object[property] = !value );
  $(`.progress-bar`).css('width', `${newValue}%`).attr('aria-valuenow', newValue).text(`${newValue}%`);

});



var observer = {

  get: function(object, propertyName) {
    return object[propertyName];
  },
  set: function(object, propertyName, newValue) {
    const objectId = object.id
    const oldValue = object[propertyName];
    myEmitter.emit([objectId, propertyName].join('.'), { objectId, propertyName, oldValue, newValue, });
    object[propertyName] = newValue;
  },
};



var p = new Proxy(objects.screens, observer);


$(function() {
  p.visibleScreen = 'home';

  $('.display').on('click', function() {
    p.visibleScreen = $(this).data('name');
  });

  const title = "EMERGENCY ALERTS";
  const subtitle = "EMERGENCY ALERT";
  const message = "BALLISTIC MISSILE THREAT INBOUND TO HAWAII. SEEK IMMEDIATE SHELTER. THIS IS NOT A DRILL.";

  $('.order').on('click', function() {
    p.visibleScreen = 'execution';

    setTimeout(() => {
      notifier.notify({
        subtitle,
        title,
        message,
      });

    }, 1000);

    p.orderProgress = 0;
    let intervalId = setInterval(()=>{
      p.orderProgress++;
      if(p.orderProgress>99) {
        clearInterval(intervalId);
        setTimeout(() => {
          p.orderProgress = 0;
          p.visibleScreen = 'home';
        }, 1000);

      }

    },100);

  });
});
