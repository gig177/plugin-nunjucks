define(function(require) {
    var path = require('path');
    return function main(address, source, lang) {
        if (!lang) return source;

        var SystemJSLoader = this;

        var basePath = _calclulateParentOfTplDir(address).replace(SystemJSLoader.baseURL, ''),
            fileName = _parseFileName(address),
            dictPath = path.join(basePath, 'loc', lang, fileName + '.loc');

        return _loadDictFile.call(SystemJSLoader, dictPath)
        .then(function(dictFile) {
            var dict = _parseDictFile(dictFile);
            return _locilizeSourceTpl(source, dict);
        });
    };
    function _locilizeSourceTpl(source, dict) {
        var out = source;
        for (var key in dict) {
            var re = new RegExp('\\[\\[\\s*?' + key + '\\s*?\\]\\]');
            out = out.replace(re, dict[key]);
            if (!out) throw new Error('Error at localization ' + key);
        }
        return out;
    }
    function _parseFileName(address) {
        var basename = path.basename(address);
        return basename.slice(0, -path.extname(basename).length);
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
    function _loadDictFile(dictPath) {
        var SystemJSLoader = this;
        return new Promise(function(resolve) {
            SystemJSLoader.import(dictPath + '!text').then(function(file) {
                resolve(file);
            }).catch(function() {
                resolve('');
            });
        });
    }
    function _calclulateParentOfTplDir(address) {
        var dir = address.split('/');
        while (dir.length)
            if (dir.pop() == 'tpl') break;
        if (!dir.length)
            throw new Error('tpl dir doesn\'t found');
        return dir.join('/') + '/';
    }
});
