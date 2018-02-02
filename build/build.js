const mkdir=require('./utils/mkdir');
const generateConfig=require('./utils/generateConfig');
const resolve = require('./utils/resolve');
const build = require('./utils/build');

const dist='dist';
const src='src/FileUpload.js';
const name='FileUpload';

mkdir(dist);
build(generateConfig([{
    input: resolve(src),
    name: name,
    output: {
        file: resolve(dist + '/' + name + '.js')
    }
},{
    input: resolve(src),
    name: name,
    output: {
        file: resolve(dist + '/' + name + '.min.js')
    }
}]));