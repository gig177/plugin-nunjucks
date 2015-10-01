var textPlugin = require('text');
//var nj = require('nunjucks/browser/nunjucks');
var nj = require('nunjucks');
var precompileGlobal = require('nunjucks/src/precompile-global');
var compiler = require('nunjucks/src/compiler'),
    Environment = nj.Environment;

var path = require('path');

if (typeof window === 'undefined') {
    global.window = {};
    global.__nodeEnv__ = true;
}

exports.translate = function(load) {
    var SystemJSLoader = this;

    var lang = this.lang || 'ru';
    var tpl = load.source;

    var basePath = _calclulateParentOfTplDir(load.address).replace(this.baseURL, ''),
        fileName = path.basename(load.address).slice(0, -5);

    return _loadDictFile.call(this, path.join(basePath, 'loc', lang, fileName + '.loc'))
    .then(function(file) {
        return new Promise(function(resolve, reject) {
            var dict = _parseDictFile(file);
            //tpl = _localizeTpl(tpl, dict);

            if (!_isNunjucksTpl(tpl)) {
                //console.log('simple html');
                resolve( textPlugin.translate(load) );
            }

            //tpl = _cleanTplFromCommonJsFormat(tpl);
            var name = _resolvePathToDir(load.address);
            /*
            console.log('name:', name);
            console.log('tpl:', load.source);
            */
            var precompiled = _precompile(tpl, name);
            var precompiledJsStr = precompileGlobal([precompiled])

            resolve(precompiledJsStr);
        });
    });
}
function _isNunjucksTpl(text) {
    return text.indexOf('{{') !== -1 || text.indexOf('{%') !== -1;
}
function _parseDictFile(file) {
    if (!file) return {};

    var out = {};
    file.split('\n').forEach(function(str) {
        if (!str) return true;
        str = str.split('=');
        out[ str[0].trim() ] = str[1].trim();
    });
    return out;
}
function _loadDictFile(requestURI) {
    var SystemJSLoader = this;
    return new Promise(function(resolve, reject) {
        SystemJSLoader.import(requestURI + '!text').then(function(file) {
            resolve(file);
        }).catch(function() {
            resolve('');
        });
    });
}
function _localizeTpl(tpl, dict) {
    for (var key in dict) {
        var ptn = new RegExp('\\[\\[\\s*?' + key + '\\s*?\\]\\]');
        tpl = tpl.replace(ptn, dict[key]);
        if (!tpl) throw new Error('Error at localization ' + key);
    }
    return tpl;
}

function _precompile(str, name, env) {
    env = env || new Environment([]);

    var asyncFilters = env.asyncFilters;
    var extensions = env.extensionsList;
    var template;

    try {
        template = compiler.compile(str,
                                    asyncFilters,
                                    extensions,
                                    name,
                                    env.opts);
    }
    catch(err) {
        console.log(err);
        //throw lib.prettifyError(name, false, err);
    }

    return { name: name, template: template };
}
function _resolvePathToDir(filePath, resolveToDir) {
    resolveToDir = resolveToDir || 'tpl';
    
    var fileName = path.basename(filePath),
        dirs = path.dirname(filePath).split('/');

    var out = [];
    var folder = null;
    while (dirs.length) {
        folder = dirs.pop();
        if (folder == 'tpl') break;
        
        out.push(folder);
    }

    return (out.length? out.reverse().join('/') + '/': '') + fileName;
}
function _calclulateParentOfTplDir(dir) {
    var dir = dir.split('/');
    while (dir.length)
        if (dir.pop() == 'tpl') break;
    if (!dir.length)
        throw new Error("tpl dir doesn't found");
    return dir.join('/') + '/';
}