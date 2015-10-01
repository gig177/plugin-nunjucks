//import html from './tpl/bar.html';
import 'tpl/_parent.html!nj';
import 'tpl/child.html!nj';

import $ from 'jquery';
import renderTpl from 'helpers/nunjucks';

$(() => {
    $('body').append( renderTpl('child.html') );
});
