var qs = require('querystring');

var url = 'http://localhost:5000';

var tests = {};
tests.child = function(client) {
    client.expect.element('._left_side').text.to.contain('Это левая сторона');
    client.expect.element('._right_side').text.to.contain('This is the right side');
    client.expect.element('._default_content').text.to.contain('This is the default content');
};
tests._parent = function(client) {
    client.expect.element('._default_content').text.to.contain('This is the default content');
    client.expect.element('._more_content').text.to.contain('This is more content');
    client.expect.element('._username').text.to.contain('Evgen');
};
tests.simple_text = function(client) {
    client.expect.element('._hello_msg').text.to.contain('hello_msg');
    client.expect.element('._by_msg').text.to.contain('прощальное сообщение');
}

var exports = {};
[
    formatQuesryString('child', 1),
    formatQuesryString('child', 0),

    formatQuesryString('_parent', 1),
    formatQuesryString('_parent', 0),

    formatQuesryString('simple_text', 1),
    formatQuesryString('simple_text', 0),
//].forEach(_unpackArgs((qs, name) => {
].forEach(_unpackArgs((name, qs) => {
        exports[qs] = function(client) {
            client.url(url + qs).pause(700);
            tests[name](client);
            client.end()
        }
}));

function formatQuesryString(tpl, dev) {
    return [tpl, '/?' + qs.stringify({ tpl : tpl, dev : dev })];
}
function _unpackArgs(construct) {
    return function(arr) {
        return construct(arr[0], arr[1]);
    }
}

module.exports = exports;
