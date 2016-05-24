'use strict';

const postcss = require('postcss');
const discardDuplicates = require('postcss-discard-duplicates');
const mergeLonghand = require('postcss-merge-longhand');
const hashPlugin = require('./plugins/hash').hashPlugin;
const hashPluginDeeper = require('./plugins/hash').hashPluginDeeper;
const mergePlugin = require('./plugins/merge-selectors').mergePlugin;
const removeCommentsPlugin = require('postcss-discard-comments');
const removeEmptyRules = require('./plugins/remove-empty-rules').removeEmptyRules;
const removeUnimportantDecls = require('./plugins/remove-unimportant-decls').removeUnimportantDecls;

const fs = require('fs');
const helper = require('./helpFunctions');

var importantOpts;

module.exports.getFirstHash = (solution) => {
    var processor = postcss([mergeLonghand, removeCommentsPlugin, mergePlugin, discardDuplicates, hashPlugin]);

    return processor.process(solution.css)
        .then(result => {
            solution.css = result;
            solution.failed = false;
            return solution;
        })
        .catch(() => {
            //console.log(solution.name);
            solution.failed = true;
            return solution;
        })
};

module.exports.getSecondHash = (solution) => {
    var processor = postcss([removeUnimportantDecls(importantOpts), removeEmptyRules, hashPluginDeeper]);

    return processor.process(solution.css)
        .then(result => {
            //console.log('true');
            //fs.writeFile(`./${solution.name}.css`, result.css.toString());
            solution.css = result;
            return solution;
        })
        .catch(() => {
            //console.log(solution.name);
            solution.failed = true;
            return solution;
        })
};

const sort = (a, b) => {
    if (+a >= +b) return 1;
    if (+a < +b) return -1;
};

module.exports.checkPair = (item1, item2) => {
    let target = item1.hashes;
    let other = item2.hashes;
    if (target.length > other.length) {
        target = item2.hashes;
        other = item1.hashes;
    }

    target.sort(sort);
    other.sort(sort);

    let pointerOfOther = 0;
    let countSimilarSelectors = 0;
    let countSelectors = target.length + other.length;

    for (let targetPointer = 0; targetPointer < target.length; targetPointer ++) {
        let find = false;
        let start = pointerOfOther;
        while (pointerOfOther < other.length && !find) {
            //if (Math.abs(target[targetPointer] - other[pointerOfOther]) < (target[targetPointer] + other[pointerOfOther]) / 2) {
            if (target[targetPointer] === other[pointerOfOther]) {
                countSimilarSelectors += 1;
                find = true;
            }

            pointerOfOther += 1;
        }

        if (!find) {
            pointerOfOther = start;
        }
    }
    //fs.writeFile('hash1.txt', target);
    //fs.writeFile('hash2.txt', other);

    //console.log(countSimilarSelectors * 2, countSelectors);

    return ((countSimilarSelectors * 2 / countSelectors) * 100).toFixed();
};

module.exports.setSettings = (settings) => {
    importantOpts = settings;
};
