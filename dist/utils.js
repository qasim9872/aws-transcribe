"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAwsEventMessage = exports.createDebugger = void 0;
var debug_1 = __importDefault(require("debug"));
function extractNameFromPath(filePath) {
    var extractedName = filePath.match(/.*\/(.*)\./);
    return extractedName ? extractedName[1] : filePath;
}
function createDebugger(filePath) {
    var name = extractNameFromPath(filePath);
    return debug_1.default("aws-transcribe:" + name);
}
exports.createDebugger = createDebugger;
function getAwsEventMessage(buffer) {
    return {
        headers: {
            ":message-type": {
                type: "string",
                value: "event",
            },
            ":event-type": {
                type: "string",
                value: "AudioEvent",
            },
        },
        body: buffer,
    };
}
exports.getAwsEventMessage = getAwsEventMessage;
//# sourceMappingURL=utils.js.map