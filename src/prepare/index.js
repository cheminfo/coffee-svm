'use strict';

var fs = require('fs-promise');
const saveData = require('./saveData');
const path = require('path');

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
    var linksTxt = await fs.readFile(path.join(__dirname, '../linksTotal.txt'), 'utf8');
    return linksTxt.split(/[\r\n]+/);
}

