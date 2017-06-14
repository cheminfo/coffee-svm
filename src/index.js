'use strict';

var fs = require('fs');
const loadData = require('./loadData');

var links = loadLinks();
var data = loadData(links, {
    reduceData: true,
    from: -0.5,
    to: 10.5,
    nbPoints: 2048,
    signals: [
        {from: 4.75, to: 4.85}
    ]
});

function loadLinks() {
    var linksTxt = fs.readFileSync(__dirname + '/links.txt','utf8');
    return linksTxt.split(/[\r\n]+/);
}