'use strict';

var table = document.querySelector('.result-table');
var tbody = table.querySelector('tbody');
var trs = tbody.querySelectorAll('tr');
var tds = table.querySelectorAll('td:not(:first-child)');

function paintColumn(index) {
    for (var i = 0; i < trs.length; i ++) {
        trs[i].querySelectorAll('td')[index].setAttribute('style', 'background: #0052d4');
        //console.log(trs[i].querySelectorAll('td')[index]);
    }
}

function resetPaint(index) {
    for (var i = 0; i < trs.length; i ++) {
        //trs[i].querySelectorAll('td')[index].setAttribute('style', 'background: #000');
        trs[i].querySelectorAll('td')[index].removeAttribute('style');
        //console.log(trs[i].querySelectorAll('td')[index]);
    }
}

function setOver(td) {
    td.addEventListener('mouseover', function() {
        paintColumn(Array.prototype.slice.call(td.parentNode.children, 0).indexOf(td));
    });

    td.addEventListener('mouseout', function() {
        resetPaint(Array.prototype.slice.call(td.parentNode.children, 0).indexOf(td));
    })
}

for (var i = 0; i < tds.length; i ++) {
    var td = tds[i];
    setOver(td);
}
