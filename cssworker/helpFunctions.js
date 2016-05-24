'use strict';

module.exports.checkResult = (percent) => {
    if (percent > 70) {
        console.log(`${percent}% - Совпадают`);
    } else if (percent > 30) {
        console.log(`${percent}% - Частично совпадают`);
    } else {
        console.log(`${percent}% - Не совпадают`);
    }
};
