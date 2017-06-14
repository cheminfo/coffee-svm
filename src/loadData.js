'use strict';


var superagent = require('superagent');
const processing = require('./processing');

module.exports = async function limsDownloader(links, options = {}) {
    var dataClass = [];
    var dataY = [];
    for (var link of links) {
        const result = await superagent.get(link);
        var metadata = JSON.parse(result.text);
        var nmrs = metadata.entry[0].nmrs.filter( a => a.experiment==='noesygpps1dcomp');
        var specie = metadata.entry[0].parameters.filter( a => a.description==='species')[0].value;
        if (nmrs.length > 0) {
            var jcamp = await superagent.get(nmrs[0].resourceURL);
            var data = processing(jcamp, options);
            dataY.push(data.getYData());
        }
        if (specie.trim().toLowerCase().match(/\barabica/)) {
            dataClass.push([0, 1]);
        } else if (specie.trim().toLowerCase().match(/\brobusta/)) {
            dataClass.push([1, 0]);
        }
    }
    return {dataClass, dataY};
}

