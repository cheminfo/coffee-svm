'use strict';

const Stat = require('ml-stat').matrix;
const fs = require('fs-promise');
const path = require('path');
const SVM = require('libsvm-js/asm');
const Kernel = require('ml-kernel');
const range = require('lodash.range');
const ConfusionMatrix = require('ml-confusion-matrix');
const Matrix = require('ml-matrix').Matrix;

const gammas = [0.0001, 0.001, 0.01, 0.1, 1, 10, 100];
const costs = [0.001, 0.01, 0.1, 1, 10, 100, 1000];

const linearKernel = new Kernel('linear');

function RBFGrid() {
    loadData().then(([data, labels]) => {
        data = featureNormalize(data);
        for (let gamma of gammas) {
            const RBFKernel = new Kernel('gaussian', {sigma: 1 / Math.sqrt(gamma)});
            for (let cost of costs) {
                const KData = RBFKernel.compute(data).addColumn(0, range(1, labels.length + 1));
                const svm = new SVM({
                    kernel: SVM.KERNEL_TYPES.PRECOMPUTED,
                    type: SVM.KERNEL_TYPES.C_SVC,
                    cost,
                    quiet: true
                });

                const predicted = svm.crossValidation(KData, labels, labels.length);
                const cm = ConfusionMatrix.fromLabels(labels, predicted);
                console.log(`rbf kernel, gamma=${gamma}, cost=${cost}`, cm.getMatrix());
                svm.free();
            }
        }

    });
}

function linearGrid() {
    loadData().then(([data, labels]) => {
        data = featureNormalize(data);
        const KData = linearKernel.compute(data).addColumn(0, range(1, labels.length + 1));
        for (let cost of costs) {
            const svm = new SVM({
                kernel: SVM.KERNEL_TYPES.PRECOMPUTED,
                type: SVM.KERNEL_TYPES.C_SVC,
                cost,
                quiet: true
            });

            const predicted = svm.crossValidation(KData, labels, labels.length);
            const cm = ConfusionMatrix.fromLabels(labels, predicted);
            console.log(`linear kernel, cost=${cost}`, cm.getMatrix());
            svm.free();
        }

    });
}

function featureNormalize(matrix) {
    var means = Stat.mean(matrix);
    var std = Stat.standardDeviation(matrix, means, true);
    std = std.map(std => std === 0 ? Number.EPSILON : std);
    return Matrix.checkMatrix(matrix)
        .subRowVector(means)
        .divRowVector(std)
        .div(2);
}

async function loadData() {
    const data = [];
    const labels = [];
    const dir = path.join(__dirname, '../../data');
    const files = await fs.readdir(dir);
    for (let file of files) {
        const fileContent = await fs.readFile(path.join(dir, file), 'utf-8');
        const sample = JSON.parse(fileContent);
        const label = getLabel('columbian', sample);
        if (label === false) continue;
        labels.push(label);
        data.push(sample.data);
    }
    return [data, labels];
}

const argv = process.argv.slice(2);
if (argv.length === 0) {
    // eslint-disable-next-line no-console
    console.warn('This script must be called with some arguments to do something (e.g. --linear)');
}
if (argv.indexOf('--linear') > -1) {
    linearGrid();
}
if (argv.indexOf('--rbf') > -1) {
    RBFGrid();
}

function getLabel(criteria, sample) {
    switch (criteria) {
        case 'arabica': {
            var specie = sample.parameters.filter(a => a.description === 'species')[0].value;
            if (specie.trim().toLowerCase().match(/\barabica/)) {
                return 0;
            } else if (specie.trim().toLowerCase().match(/\brobusta/)) {
                return 1;
            } else {
                return false;
            }
        }
        case 'columbian': {
            var country = sample.parameters.filter(a => a.description === 'country')[0].value;
            if (!country) {
                return false;
            }
            if (country.toLowerCase() === 'colombia') {
                return 0;
            } else {
                return 1;
            }
        }
        default:
            throw new Error('invalid criterium');
    }

}