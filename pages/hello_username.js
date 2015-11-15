import 'tpl/hello_username.html!nj';

import $ from 'jquery';
import renderTpl from 'helpers/nunjucks';

$(() => {
    $('body').append( renderTpl('hello_username.html', { username : 'Evgen' }) );
});
