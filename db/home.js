module.exports = function({statements}){

  statements.push({
    base:{
      objectId:'session',
      propertyName:'text',
      newValue: '',
    },
    pattern: 'Clear Screen'
  });

  statements.push({
    base:{
      operation: 'append',
      objectId:'session',
      propertyName:'text',
      type: 'text/plain',
      newValue: '<hr>',
    },
    pattern: 'Horizontal Rule'
  });

  statements.push({
    base:{
      operation: 'append',
      objectId:'session',
      propertyName:'text',
      type: 'text/md',
      newValue: require('fs').readFileSync('./README.md').toString(),
    },
    pattern: 'Include README.md'
  });

  statements.push({
    base:{
      type: 'text/plain',
      objectId:'session',
      propertyName:'title'
    },
    pattern: 'Set title to "(?<newValue>[a-zA-Z0-9 ]+)".'
  });

  statements.push({
    base:{
      operation: 'append',
      type: 'html/href',
      objectId:'session',
      propertyName:'text'
    },
    pattern: 'Create action link: (?<newValue>.+)$'
  });

  statements.push({
    base:{
      operation: 'append',
      type: 'text/plain',
      objectId:'session',
      propertyName:'text'
    },
    pattern: 'Print text: (?<newValue>.+)$'
  });

}
