import nj from 'nunjucks';

export var PrecompiledLoader = nj.Loader.extend({
    init: function(compiledTemplates) {
        // setup a process which watches templates here
        // and call `this.emit('update', name)` when a template
        // is changed
        this.precompiled = compiledTemplates || window.nunjucksPrecompiled || {};
    },

    getSource: function(name) {
        // load the template
        // return an object with:
        //   - src:     String. The template source.
        //   - path:    String. Path to template.
        //   - noCache: Bool. Don't cache the template (optional).
        return {
            src: {
                type: 'code',
                obj: this.precompiled[name]
            },
            path: name
        };
    }
});

export var env = new nj.Environment( new PrecompiledLoader() ); 
export default function(tpl, ctx) {
    return env.render(tpl, ctx);
};
