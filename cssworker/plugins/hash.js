'use strict';

const postcss = require('postcss');

const alph = ' abcdefghijklmnopqrstuvwxyz-0123456789';

function stringHash(s) {
    var h = 0;
    for (var i = 0; i < s.length; i ++) {
        h += alph.indexOf(s[i].toLowerCase()) * Math.pow(17, i)
    }
    return h
}

module.exports.hashPlugin = postcss.plugin('postcss-hash', () => {
    return (css, result) => {
        result.hashes = [];
        css.walkRules((rule) => {
            let hash = 0;
            rule.walkDecls((decl) => {
                hash += stringHash(decl.prop);
            });

            result.hashes.push(hash);
        });
    };
});

//hash со значением

module.exports.hashPluginDeeper = postcss.plugin('postcss-hash-deeper', () => {
    return (css, result) => {
        result.hashes = [];
        css.walkRules((rule) => {
            let hash = 0;
            rule.walkDecls((decl) => {
                hash += stringHash(decl.prop);
                if (!Number(decl.value)) {
                    hash += stringHash(decl.value);
                }
            });

            result.hashes.push(hash);
        });
    };
});
