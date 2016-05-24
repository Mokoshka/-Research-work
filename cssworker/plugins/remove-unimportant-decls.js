'use strict';

const postcss = require('postcss');

var status = 'important';

const standart = {
    important: [],
    unimportant: [
        'color',
        'background',
        'box-shadow',
        'text-shadow',
        'border',
        'outline',
        'margin',
        'padding',
        'text-indent',
        'font',
        'width',
        'height'
]};

function setOpts(opts) {
    opts = opts || standart;
    var important = opts.important;
    if (!important || !important.length) {
        important = opts.unimportant;
        status = 'unimportant';
    }

    return important;
}

function isUnimportant(prop, important) {
    let find = important.find(p => prop.indexOf(p) > -1);

    if ((find && status === 'unimportant') || (!find && status === 'important')) {
        return true;
    }

    if ((find && status === 'important') || (!find && status === 'unimportant')) {
        return false;
    }
}

module.exports.removeUnimportantDecls = postcss.plugin('postcss-remove-unimportant-decls', (opts) => {
    var important = setOpts(opts);

    //console.log(important);

    return (css) => {
        css.walkRules(rule => {
            rule.walkDecls(decl => {
                if (isUnimportant(decl.prop, important)) {
                    //console.log(decl.prop);
                    rule.removeChild(decl);
                }
            });
        });
    }
});
