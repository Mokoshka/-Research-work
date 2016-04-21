'use strict';

const postcss = require('postcss');
const fs = require('fs');
const discardDuplicates = require('postcss-discard-duplicates');
const unimportantProperty = require('./unimportant.js').unimportantProperty;

const alph = ' abcdefghijklmnopqrstuvxyz';
const css1 = fs.readFileSync(process.argv[2]);
const css2 = fs.readFileSync(process.argv[3]);


function isImportant(prop) {
    for (var i = 0; i < unimportantProperty.length; i ++) {
        if (prop.indexOf(unimportantProperty[i]) >= 0) {
            return false;
        }
    }
    return true;
}

function stringHash(s) {
    var h = 0;
    for (var i = 0; i < s.length; i ++) {
        h += alph.indexOf(s[i]) * Math.pow(17, i)
    }
    return h
}

function createNewRule(selector, decls, css) {
    css.append({selector: selector});
    decls.forEach(decl => {
        css.last.append(decl);
    });
}

var previousRule = {};
var hashes = [];
var hash;

const mergePlugin = postcss.plugin('postcss-merge-selectors', () => {
    return (css, result) => {
        result.newRules = {};
        css.walkRules((rule) => {
            rule.selectors.forEach(selector => {
                if (result.newRules.hasOwnProperty(selector)) {
                    rule.walkDecls(decl => {
                        result.newRules[selector].push({prop: decl.prop, value: decl.value});
                    });
                } else {
                    result.newRules[selector] = [];
                    rule.walkDecls(decl => {
                        result.newRules[selector].push({prop: decl.prop, value: decl.value});
                    });
                }
            });
            css.removeChild(rule);
        });
        for (let selector in result.newRules) {
            if (result.newRules.hasOwnProperty(selector)) {
                createNewRule(selector, result.newRules[selector], css);
            }
        }
    }
});

const removeCommentsPlugin = postcss.plugin('postcss-remove-comments', () => {
    return (css, result) => {
        css.walkComments(comment => {
            css.removeChild(comment);
        })
    }
});

const hashPlugin = postcss.plugin('postcss-hash', () => {
    return (css, result) => {
        result.hashes = [];
        css.walkRules((rule) => {
            hash = 0;
            rule.walkDecls((decl) => {
                hash += stringHash(decl.prop);
            });
            result.hashes.push(hash);
        });
    };
});

const removeUnimportantDecls = postcss.plugin('postcss-remove-unimportant-decls', () => {
    return (css, result) => {
        css.walkRules(rule => {
            rule.walkDecls(decl => {
                if (!isImportant(decl.prop)) {
                    rule.removeChild(decl);
                }
            });
        });
    }
});

const removeEmptyRules = postcss.plugin('postcss-remove-empty-rules', () => {
    return (css, result) => {
        css.walkRules(rule => {
            if (rule.nodes.length === 0) {
                css.removeChild(rule);
            }
        })
    }
});

const sort = (a, b) => {
    if (a >= b) return 1;
    if (a < b) return -1;
};

function checkResult(percent) {
    if (percent > 70) {
        console.log(`${percent}% - Совпадают`);
    } else if (percent > 30) {
        console.log(`${percent}% - Частично совпадают`);
    } else {
        console.log(`${percent}% - Не совпадают`);
    }
}

function compareHashes(hashes) {
    var percent;
    if (hashes[0].length != hashes[1].length) {
        if (hashes[0].length < hashes[1].length) {
            percent = (hashes[0].length / hashes[1].length * 100).toFixed();
        } else {
            percent = (hashes[1].length / hashes[0].length * 100).toFixed();
        }
        return percent;
    }

    hashes[0].sort(sort);
    hashes[1].sort(sort);

    var countSelectors = hashes[0].length;
    var countSimilarSelectors = 0;

    for (let i = 0; i < countSelectors; i++) {
        if (Math.abs(hashes[0][i] - hashes[1][i]) < (hashes[0][i] + hashes[1][i]) / 2) {
            countSimilarSelectors += 1;
        }
    }

    return countSimilarSelectors / countSelectors * 100;
}

// ===============================  processing  ==========================================
var processor = postcss([removeCommentsPlugin, mergePlugin, discardDuplicates, hashPlugin]);
var secondProcessor = postcss([removeUnimportantDecls, removeEmptyRules, hashPlugin]);

Promise.all([
    processor.process(css1)
        .then((result) => {
            fs.writeFile('./examples/new_example1.css', result.css);
            return result;
        }),
    processor.process(css2)
        .then((result) => {
            fs.writeFile('./examples/new_example2.css', result.css);
            return result;
        })
])
    .then(results => {
        var hashes = [];
        var csss = [];
        results.forEach((res) => {
            hashes.push(res.hashes);
            csss.push(res.css);
        });
        var firstResult = compareHashes(hashes);
        if (firstResult > 60) {
            secondTest(csss[0], csss[1]);
        } else {
            checkResult(firstResult);
        }
    });

function secondTest(css1, css2) {
    Promise.all([
        secondProcessor.process(css1)
            .then(result => {
                return result;
            }),
        secondProcessor.process(css2)
            .then(result => {
                return result;
            })
    ])
        .then(results => {
            var hashes = [];
            results.forEach(res => {
                hashes.push(res.hashes);
            });
            checkResult(compareHashes(hashes));
        })
    .catch(err => {
            console.log(err.stack);
        })
}
