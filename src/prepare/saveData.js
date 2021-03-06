'use strict';


var superagent = require('superagent');
const processing = require('./processing');
const request = require('request-promise');
const fs = require('fs-promise');
const path = require('path');

module.exports = async function limsDownloader(links, options = {}) {
    var label;
    for (var link of links) {
        const m = /id=(\d+)&key=(.*)$/.exec(link);
        if (!m) throw new Error('mismatch');
        const result = await superagent.get(link);
        var metadata = JSON.parse(result.text);
        var nmrs = metadata.entry[0].nmrs.filter(a => a.experiment === 'noesygpps1dcomp');

        if (nmrs.length > 0) {
            var jcamp = await request(nmrs[0].resourceURL);
            var data = processing(jcamp, options);
            const y = data.sd.spectra[0].data[0].y;
            await fs.writeFile(path.join(__dirname, '../../data', `${m[1]}_${m[2]}.json`), JSON.stringify({
                data: y,
                parameters: metadata.entry[0].parameters
            }));
        }
    }
};

