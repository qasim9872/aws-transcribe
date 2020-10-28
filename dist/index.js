"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
var AwsTranscribe_1 = require("./AwsTranscribe");
Object.defineProperty(exports, "AwsTranscribe", { enumerable: true, get: function () { return AwsTranscribe_1.AwsTranscribe; } });
var StreamingClient_1 = require("./StreamingClient");
Object.defineProperty(exports, "StreamingClient", { enumerable: true, get: function () { return StreamingClient_1.StreamingClient; } });
var TranscribeException_1 = require("./TranscribeException");
Object.defineProperty(exports, "TranscribeException", { enumerable: true, get: function () { return TranscribeException_1.TranscribeException; } });
__exportStar(require("./types"), exports);
//# sourceMappingURL=index.js.map