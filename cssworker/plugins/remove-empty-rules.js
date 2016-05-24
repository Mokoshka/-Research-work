'use strict';

const postcss = require('postcss');

module.exports.removeEmptyRules = postcss.plugin('postcss-remove-empty-rules', () => {
    return (css) => {
        css.walkRules(rule => {
            if (rule.nodes.length === 0) {
                css.removeChild(rule);
            }
        })
    }
});
