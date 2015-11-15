var qs = require('querystring'),
    _ = require('underscore');

var url = 'http://localhost:3000';

var tests = {};
tests.child = function(client) {
    client.expect.element('._default_content').text.to.contain('This is the default content').before(3000);
    client.expect.element('._left_side').text.to.contain('This is the left side');
};
tests._parent = function(client) {
    client.expect.element('._default_content').text.to.contain('This is the default content').before(3000);
    client.expect.element('._right_side').text.to.contain('This is the right content of parent');
};
tests.hello_username = function(client) {
    client.expect.element('._hello_msg').text.to.contain('hello_start').before(3000);
    client.expect.element('._hello_msg').text.to.contain('Evgen');
}

tests.before_precompile_hook = function(client) {
    client.expect.element('._hello_msg').text.to.contain('Привет').before(3000);
}

var exports = {};
[
    formatQuesryString('child', { dev: 1 }),
    formatQuesryString('_parent', { dev: 1 }),
    formatQuesryString('hello_username', { dev: 1 }),
    formatQuesryString('before_precompile_hook', { dev: 1, tpl: 'hello_username', lang: 'ru' }),

    /*
    formatQuesryString('child', { dev: 1 }),
    formatQuesryString('_parent', { dev: 1 }),
    formatQuesryString('hello_username', { dev: 1 }),
    formatQuesryString('before_precompile_hook', { dev: 1, tpl: 'hello_username', lang: 'ru' }),
    */
].forEach(_unpackArgs((name, qs) => {
    exports[qs] = function(client) {
        client.url(url + qs);
        tests[name](client);
        client.end()
    }
}));

function formatQuesryString(testName, params) {
    params = _.extend({
        tpl: testName,
    }, params);
    return [testName, '/?' + qs.stringify(params)];
}
function _unpackArgs(construct) {
    return function(arr) {
        return construct(arr[0], arr[1]);
    }
}

module.exports = exports;
