'use strict';

var fs = require('fs-promise');
const saveData = require('./saveData');
const Stat = require('ml-stat/matrix');


loadLinks().then((links) => {
    return saveData(links, {
        reduceData: true,
        from: -0.5,
        to: 10.5,
        nbPoints: 2048,
        signals: [
            {from: 4.75, to: 4.85}
        ]
    });
});
async function loadLinks() {
    var linksTxt = await fs.readFile(__dirname + '/linksTotal.txt', 'utf8');
    return linksTxt.split(/[\r\n]+/);
}

function featureNormalize(matrix) {
    var means = Stat.mean(matrix);
    var std = Stat.standardDeviation(matrix, means, true);
    var result = matrix.subRowVector(means);
    return {result: result.divRowVector(std), means: means, std: std};
}
