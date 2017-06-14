'use strict';

const SD = require('spectra-data');
const defaultOptions = {reduceData: false};

module.exports = function processing(jcamp, options = {}) {
    options = Object.assign({}, defaultOptions, options);
    var signals = options.signals || [];
    var spectrum = SD.NMR.fromJcamp(jcamp, {});
    if(options.reduceData) {
        spectrum.reduceData(options.from, options.to, {nbPoints: options.nbPoints});
    }
    spectrum.suppressZones(signals);
    return spectrum;
};