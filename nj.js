var nj = require('nunjucks');
var precompileGlobal = require('nunjucks/src/precompile-global');
var compiler = require('nunjucks/src/compiler'),
    Environment = nj.Environment;
var path = require('path'),
    _ = require('underscore');
/*
 * This hack is obliging to these lines
 * https://github.com/mozilla/nunjucks/blob/v2.1.0/browser/nunjucks-slim.js#L503
 * Generate ReferenceError at building time
 */
if (typeof window === 'undefined')
    global.window = {};

exports.translate = function(load) {
    var opts = _.extend({
        beforePrecompile: null,
        rootDir: 'tpl',
    }, this.njOptions);

    return _loadBeforePrecompileHook.call(this, opts.beforePrecompile)
    .then(function(hook) {
        return hook.call(this, load.address, load.source);
    }).then(function(transformedSource) {
        return main.call(this, load.address, transformedSource || load.source);
    });
};
function main(address, source) {
    return new Promise(function(resolve) {
        var name = _resolvePathToDir(address);
        var precompiled = _precompile(source, name);
        var precompiledJsStr = precompileGlobal([precompiled]);
        resolve(precompiledJsStr);
    });
}
function _loadBeforePrecompileHook(obj) {
    var hookPath = obj? Object.keys(obj)[0]: null,
        hookArgs = hookPath? obj[hookPath]: null;
    if (!(hookArgs instanceof Array))
        hookArgs = [hookArgs];

    if (!hookPath)
        return Promise.resolve(_noop);

    var SystemJSLoader = this;
    return new Promise(function(resolve) {
        SystemJSLoader.import(hookPath).then(function(hook) {
            resolve(function() {
                var args = Array.prototype.slice.call(arguments).concat(hookArgs);
                return _handleResult(
                    hook.apply(SystemJSLoader, args)
                );
            });
        }).catch(function() {
            resolve(_noop);
        });
    });
    function _noop() {}
    function _handleResult(result) {
        return typeof result === 'string'? Promise.resolve(result): result;
    }
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
/*
 * This snippet has borrowed from the original nunjucks code base
 * https://github.com/mozilla/nunjucks/blob/v2.1.0/src/precompile.js#L113
 */
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
