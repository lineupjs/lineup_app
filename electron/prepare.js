
const fs = require('fs');
const base = require('../package.json');
const tmpl = require('./package.tmpl.json');

// override tmpl
Object.assign(base, tmpl);

fs.writeFileSync('./package.json', JSON.stringify(base, null, ' '));
