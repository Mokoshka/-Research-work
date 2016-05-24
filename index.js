'use strict';

const args = require('minimist')(process.argv.slice(2));
const git = require('./git/git.js');
const viewer = require('./viewer/templates.js');
const json = require(`./${args.o}`);
const cssworker = require('./cssworker/cssworker.js');
const ProgressBar = require('progress');

//var bar = new ProgressBar('[:bar]', { complete: '#', total: 40 });
//var timer = setInterval(function () {
//    bar.tick();
//    if (bar.complete) {
//        //console.log('\ncomplete\n');
//        clearInterval(timer);
//    }
//}, 320);

const fs = require('fs');

function setSettings(settings) {
    git.setSettings(settings.git);
    cssworker.setSettings(settings.css);
}

setSettings(json);

function checkAllFiles(solutions, limit) {
    limit = limit || 100;
    let similarity;
    let suspicions = new Set();

    solutions = solutions.filter(solution => {
        if (solution.failed) {
            fails.add(solution.name);
        }
        return (!solution.failed);
    });

    //let checkSolutions = solutions.filter(solution => {
    //    return solution.author.indexOf(author) > -1
    //});

    //checkSolutions.forEach(solution => {
    solutions.forEach(solution => {
        let next = solutions.indexOf(solution) + 1;
        let len = solutions.length;

        for (let i = next; i < len; i ++) {
            similarity = cssworker.checkPair(solution.css, solutions[i].css);

            statistic.add({
                pair: [solution.name, solutions[i].name],
                similarity,
                suspicion: similarity > limit
            });

            if (similarity > limit) {
                suspicions.add(solution).add(solutions[i]);
            }
        }
    });

    let suspicionsPromise = [];
    suspicions.forEach(solution => {
        suspicionsPromise.push(cssworker.getSecondHash(solution));
    });

    return suspicionsPromise;
}

function checkSuspicions(solutions) {
    statistic.forEach(pair => {
        if (!pair.suspicion) return;

        let solution1 = solutions.find(solution => {return solution.name === pair.pair[0]});
        let solution2 = solutions.find(solution => {return solution.name === pair.pair[1]});
        //console.log(index1, index2);
        pair.similarity = cssworker.checkPair(solution1.css, solution2.css);
    });
}

//var author = args.a || '';
var condition = args.s || '0';
var statistic = new Set();
var fails = new Set();

const isSuitable = new Function('similarity', `return similarity > ${condition}`);

git.getCssFiles(args._[0])
    .then(results => {
        results = results.map(solution => {
            //fs.writeFile(`./${args._[0]}/${solution.name}.css`, solution.css);
            return cssworker.getFirstHash(solution);
        });

        return Promise.all(results);
    })
    .then(solutions => {
        let suspicions = checkAllFiles(solutions, 60);

        return Promise.all(suspicions);
    })
    .then(solutions => {
        checkSuspicions(solutions);
    })
    .then(() => {
        viewer.createHTML({statistic,
            title: args._[0]});
    })
    .catch(err => {
        //clearInterval(timer);
        console.log(err.stack);
    });


