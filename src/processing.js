'use strict';

const SD = require('SD');
const defaultOptions = {reduceData: false};

module.exports = function (jcamp, options = {}) {
    options = Object.assign({}, defaultOptions, options);
    var signals = options.signals || [];
    var spectrum = SD.NMR.fromJcamp(jcamp, {});
    if(options.reduceData) {
        spectrum.reduceData(options.from, options.to, options.nbPoints);
    }
    spectrum.suppressZones(options.signals);
    return spectrum;
};