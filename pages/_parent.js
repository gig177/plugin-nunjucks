import 'tpl/_parent.html!nj';

import $ from 'jquery';
import renderTpl from 'helpers/nunjucks';

$(() => {
    $('body').append( renderTpl('_parent.html', { username : 'Evgen' }) );
});
