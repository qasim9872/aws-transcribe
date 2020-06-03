"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamingClient = void 0;
var stream_1 = require("stream");
var utils_1 = require("./utils");
var TranscribeException_1 = require("./TranscribeException");
var aws_message_utils_1 = require("./aws-message-utils");
var isBrowser = typeof window !== "undefined";
var WebSocket = isBrowser ? window.WebSocket : require("ws");
var debugLog = utils_1.createDebugger(__filename);
var STREAM_EVENTS;
(function (STREAM_EVENTS) {
    STREAM_EVENTS["OPEN"] = "open";
    STREAM_EVENTS["DATA"] = "data";
    STREAM_EVENTS["ERROR"] = "error";
    STREAM_EVENTS["CLOSE"] = "close";
})(STREAM_EVENTS || (STREAM_EVENTS = {}));
var StreamingClient = (function (_super) {
    __extends(StreamingClient, _super);
    function StreamingClient(url) {
        var _this = _super.call(this) || this;
        _this.url = url;
        _this.ws = new WebSocket(_this.url);
        _this.ws.addEventListener("open", _this._onopen.bind(_this));
        _this.ws.addEventListener("message", _this._onmessage.bind(_this));
        _this.ws.addEventListener("error", _this._onerror.bind(_this));
        _this.ws.addEventListener("close", _this._onclose.bind(_this));
        if (isBrowser) {
            _this.ws.binaryType = "arraybuffer";
        }
        return _this;
    }
    StreamingClient.prototype._onopen = function () {
        debugLog("opened connection to aws transcribe");
        this.emit(StreamingClient.EVENTS.OPEN);
    };
    StreamingClient.prototype.handleException = function (exception, type) {
        if (type === void 0) { type = "error"; }
        debugLog(type + " occurred: ", exception);
        this.emit(StreamingClient.EVENTS.ERROR, exception);
    };
    StreamingClient.prototype._onmessage = function (event) {
        var message = event.data || event;
        var _a = aws_message_utils_1.fromBinary(message), wrapper = _a.wrapper, body = _a.body;
        debugLog("wrapper: ", JSON.stringify(wrapper));
        debugLog("body: ", JSON.stringify(body));
        if (wrapper.headers[":message-type"].value === "event") {
            var eventType = wrapper.headers[":event-type"].value;
            debugLog(eventType + ": ", body);
            this.emit(StreamingClient.EVENTS.DATA, body, eventType);
        }
        else {
            var exceptionType = wrapper.headers[":exception-type"].value;
            var exceptionMessage = body.Message;
            this.handleException(new TranscribeException_1.TranscribeException(exceptionType, exceptionMessage), "exception");
        }
    };
    StreamingClient.prototype._onerror = function (event) {
        var error = event.error;
        debugLog("error occurred on aws transcribe connection", error);
        this.handleException(error);
    };
    StreamingClient.prototype._onclose = function (event) {
        var code = event.code;
        var reason = event.reason;
        debugLog("closed connection to aws transcribe", { code: code, reason: reason });
        this.emit(StreamingClient.EVENTS.CLOSE, code, reason);
    };
    StreamingClient.prototype._write = function (chunk, _, cb) {
        var binary = aws_message_utils_1.toBinary(chunk);
        this.ws.readyState === 1 && this.ws.send(binary);
        cb && cb();
    };
    StreamingClient.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        if (this.ws) {
            this.ws.removeAllListeners && this.ws.removeAllListeners();
            this.ws.readyState === 1 && this.ws.close(1000);
        }
    };
    StreamingClient.EVENTS = STREAM_EVENTS;
    return StreamingClient;
}(stream_1.Writable));
exports.StreamingClient = StreamingClient;
//# sourceMappingURL=StreamingClient.js.map