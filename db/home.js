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
      append: true,
      objectId:'session',
      propertyName:'text',
      type: 'text/plain',
      newValue: '<hr>',
    },
    pattern: 'Horizontal Rule'
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
      append: true,
      type: 'html/href',
      objectId:'session',
      propertyName:'text'
    },
    pattern: 'Create action link: (?<newValue>.+)$'
  });

  statements.push({
    base:{
      append: true,
      type: 'text/plain',
      objectId:'session',
      propertyName:'text'
    },
    pattern: 'Print text: (?<newValue>.+)$'
  });

}
