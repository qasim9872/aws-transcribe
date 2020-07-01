"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isFalsy(v) {
    return !v;
}
exports.isFalsy = isFalsy;
function isString(v) {
    return typeof v === "string";
}
exports.isString = isString;
function validateIsStringOtherwiseThrow(v, name) {
    if (isFalsy(v)) {
        throw new Error(name + " is not defined. it needs to be set in the environment or explicitly passed in the config");
    }
    else if (!isString(v)) {
        throw new Error(name + " must be a string");
    }
    return true;
}
exports.validateIsStringOtherwiseThrow = validateIsStringOtherwiseThrow;
//# sourceMappingURL=validation.js.map