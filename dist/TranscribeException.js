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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscribeException = void 0;
var EXCEPTION;
(function (EXCEPTION) {
    EXCEPTION["BadRequestException"] = "BadRequestException";
    EXCEPTION["InternalFailureException"] = "InternalFailureException";
    EXCEPTION["LimitExceededException"] = "LimitExceededException";
    EXCEPTION["UnrecognizedClientException"] = "UnrecognizedClientException";
})(EXCEPTION || (EXCEPTION = {}));
var EXCEPTIONS_MAP = (_a = {},
    _a[EXCEPTION.BadRequestException] = "There was a client error when the stream was created, or an error occurred while streaming data. Make sure that your client is ready to accept data and try your request again.",
    _a[EXCEPTION.InternalFailureException] = "Amazon Transcribe had a problem during the handshake with the client. Try your request again.",
    _a[EXCEPTION.LimitExceededException] = "The client exceeded the concurrent stream limit. For more information, see Amazon Transcribe Limits in the Amazon Web Services General Reference. Reduce the number of streams that you are transcribing.",
    _a[EXCEPTION.UnrecognizedClientException] = "The WebSocket upgrade request was signed with an incorrect access key or secret key. Make sure that you are correctly creating the access key and try your request again.",
    _a);
var TranscribeException = (function (_super) {
    __extends(TranscribeException, _super);
    function TranscribeException(type, message) {
        var _this = _super.call(this, message) || this;
        _this.type = type;
        _this.description = TranscribeException.isException(type)
            ? EXCEPTIONS_MAP[type]
            : "no description available for this exception type";
        return _this;
    }
    TranscribeException.isException = function (type) {
        return Object.values(EXCEPTION).includes(type);
    };
    TranscribeException.EXCEPTION = EXCEPTION;
    TranscribeException.EXCEPTIONS_MAP = EXCEPTIONS_MAP;
    return TranscribeException;
}(Error));
exports.TranscribeException = TranscribeException;
//# sourceMappingURL=TranscribeException.js.map