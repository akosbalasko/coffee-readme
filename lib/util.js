"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNotNull = exports.getActionOptions = exports.getPathsToUpdate = exports.getBooleanInput = void 0;
const core_1 = require("@actions/core");
const fast_glob_1 = require("fast-glob");
function getBooleanInput(name, options) {
    const value = (0, core_1.getInput)(name, options).toLowerCase();
    if (value === 'true') {
        return true;
    }
    if (value === 'false') {
        return false;
    }
    throw new Error(`Invalid input: ${value}`);
}
exports.getBooleanInput = getBooleanInput;
function getPathsToUpdate() {
    return 'readme.md';
    /*
    const rawPaths = getInput('file-path');
    const allowDot = getBooleanInput('allow-dot');

    return flatten(
        rawPaths.split(/\r?\n/).map((path) => {
            return expandPathPattern(path, { dot: allowDot });
        })
    );*/
}
exports.getPathsToUpdate = getPathsToUpdate;
function getActionOptions() {
    const token = (0, core_1.getInput)('GH_TOKEN', { required: true });
    const message = (0, core_1.getInput)('COMMIT-MESSAGE', { required: true });
    const branch = (0, core_1.getInput)('BRANCH');
    const committerName = 'Buy Me a Coffee Readme action';
    const committerEmail = 'noreply@buymeacoffeereadmeaction.com';
    return { token, message, branch, committerName, committerEmail };
}
exports.getActionOptions = getActionOptions;
function isNotNull(arg) {
    return arg !== null;
}
exports.isNotNull = isNotNull;
function expandPathPattern(path, { dot = false }) {
    const pathPattern = path.trim();
    if ((0, fast_glob_1.isDynamicPattern)(pathPattern)) {
        return (0, fast_glob_1.sync)(pathPattern, { dot });
    }
    return [pathPattern];
}
function flatten(items) {
    return items.reduce((collection, item) => collection.concat(item), []);
}
