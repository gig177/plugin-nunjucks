var express = require('express'),
    nj = require('nunjucks');
var app = express();

app.get('/', function(req, res) {
    var dev = req.query.dev;
    if (!dev) dev = 1;
    var ctx = {
        DEV: dev,
        tpl: req.query.tpl,
        lang: req.query.lang
    };
    console.log(ctx);
    res.send( nj.render('tpl/index.html', ctx) );
});
app.use( express.static('.') );

app.listen(3000);
