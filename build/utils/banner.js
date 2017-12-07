const pkg = require('../../package.json');
module.exports = '/*!\n' +
    ' * '+pkg.name+' v' + pkg.version + '\n' +
    ' * (c) 2017-' + new Date().getFullYear() + ' penyuying\n' +
    ' * Released under the MIT License.\n' +
    ' */';