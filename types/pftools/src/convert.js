const outputTemplate = require('./templates/pfidb_template.hbs');

const dynamicNames = {};

function formatParameterID(param) {
  let paramId = param.split('.').pop();
  paramId = paramId.replace(/\//g, '.').replace(/\.\./g, '.');
  return paramId;
}

function formatValue(value) {
  let input = value[0];
  if (
    input === undefined ||
    (typeof input === 'string' && input.toLowerCase() === 'nan')
  ) {
    input = null;
  } else if (typeof input === 'string' && !/\d/.test(input)) {
    input = `'${value.join('')}'`;
  } else if (typeof input === 'boolean') {
    const [first, ...rest] = input.toString().slice();
    input = first.toUpperCase() + rest.join('');
  }
  return input;
}

function testForDynamicName(param, value) {
  if (param.endsWith('_')) {
    // This is a dynamically created name, remember it
    dynamicNames[param] = value.replace(/'/g, '');
    // This key should not be added to script - return null
    return null;
  }

  // Check to see if path requires dynamic name
  const path = param.split('.');
  let paramId = param;
  path.forEach((key) => {
    if (key.endsWith('_')) {
      paramId = paramId.replace(key, dynamicNames[key]);
    }
  });
  return paramId;
}

module.exports = function convert(dataModel) {
  const results = {};
  const parameters = [];

  Object.keys(dataModel.data).forEach((views) => {
    dataModel.data[views].forEach((view) => {
      Object.keys(view).forEach((attribute) => {
        if (attribute !== 'name' && attribute !== 'id') {
          Object.keys(view[attribute]).forEach((parameter) => {
            const params = view[attribute][parameter];
            let paramId = formatParameterID(params.id);
            const val = formatValue(params.value);
            if (val !== null) {
              paramId = testForDynamicName(paramId, val);
              if (paramId !== null) {
                parameters.push({
                  parameter: `'${paramId}': ${val},`,
                });
              }
            }
          });
        }
      });
    });
  });

  results['pfidb_template.py'] = outputTemplate({ parameters });
  return { results, model: dataModel };
};
