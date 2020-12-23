const outputTemplate = require('./templates/pfidb_template.hbs');

module.exports = function convert(dataModel) {
  let results = {};
  results['pfidb_template'] = outputTemplate({ dataModel });
  return {results, model: dataModel };
};
