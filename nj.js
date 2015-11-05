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
    var lang = '';
    if ('njOptions' in this && 'locale' in this.njOptions)
        lang = this.njOptions.locale;
    var tpl = load.source;

    var basePath = _calclulateParentOfTplDir(load.address).replace(this.baseURL, ''),
        fileName = path.basename(load.address).slice(0, -5);

    var SystemJSLoader = this;
    return _loadDictFile.call(SystemJSLoader, path.join(basePath, 'loc', lang, fileName + '.loc'), !!lang)
    .then(function(file) {
        return new Promise(function(resolve, reject) {
            var dict = _parseDictFile(file);
            if (dict)
                tpl = _localizeTpl(tpl, dict);

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
function _loadDictFile(requestURI, isLocalize) {
    if (!isLocalize) {
        return new Promise(function(resolve) {
            resolve('');
        });
    }

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


// this snippet from origin nunjucks code base
// https://github.com/mozilla/nunjucks/blob/v2.1.0/src/precompile.js#L113
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
    } catch(err) {
        throw nj.lib.prettifyError(name, false, err);
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
        throw new Error('tpl dir doesn\'t found');
    return dir.join('/') + '/';
}
