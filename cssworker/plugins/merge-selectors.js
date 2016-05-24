'use strict';
const postcss = require('postcss');
const fs = require('fs');

function checkSelector(rule, accumulator) {
    rule.selectors.forEach(selector => {
        if (accumulator.hasOwnProperty(selector)) {
            rule.walkDecls(decl => {
                accumulator[selector].push({prop: decl.prop, value: decl.value});
            });
        } else if (selector) {
            accumulator[selector] = [];
            rule.walkDecls(decl => {
                accumulator[selector].push({prop: decl.prop, value: decl.value});
            });
        }
    });
}

function createNewRule(selector, decls, css) {
    css.append({selector});
    decls.forEach(decl => {
        css.last.append(decl);
    });
}

module.exports.mergePlugin = postcss.plugin('postcss-merge-selectors', () => {
    return (css, result) => {
        result.newRules = {};
        css.walkRules((rule) => {
            if (rule.parent.type !== 'atrule') {
                checkSelector(rule, result.newRules);
                css.removeChild(rule);
            }
        });

        for (let selector in result.newRules) {
            if (result.newRules.hasOwnProperty(selector)) {
                createNewRule(selector, result.newRules[selector], css);
            }
        }
    }
});
