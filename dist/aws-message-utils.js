"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBinary = exports.fromBinary = exports.eventStreamMarshaller = void 0;
var eventstream_marshaller_1 = require("@aws-sdk/eventstream-marshaller");
var util_utf8_node_1 = require("@aws-sdk/util-utf8-node");
var utils_1 = require("./utils");
exports.eventStreamMarshaller = new eventstream_marshaller_1.EventStreamMarshaller(util_utf8_node_1.toUtf8, util_utf8_node_1.fromUtf8);
var decoder = (function () {
    var TextDecoder = typeof window !== "undefined" ? window.TextDecoder : require("util").TextDecoder;
    return new TextDecoder("utf-8");
})();
function fromBinary(message) {
    var wrapper = exports.eventStreamMarshaller.unmarshall(Buffer.from(message));
    var body = JSON.parse(decoder.decode(wrapper.body));
    return { wrapper: wrapper, body: body };
}
exports.fromBinary = fromBinary;
function toBinary(chunk) {
    var audioEventMessage = utils_1.getAwsEventMessage(Buffer.from(chunk));
    return exports.eventStreamMarshaller.marshall(audioEventMessage);
}
exports.toBinary = toBinary;
//# sourceMappingURL=aws-message-utils.js.map