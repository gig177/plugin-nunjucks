import nj from 'nunjucks';
import PrecompiledLoader from 'nunjucks/src/precompiled-loader';

export var env = new nj.Environment( new PrecompiledLoader(window.nunjucksPrecompiled) ); 
export default function(tpl, ctx) {
    return env.render(tpl, ctx);
}
