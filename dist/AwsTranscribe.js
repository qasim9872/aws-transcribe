"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsTranscribe = void 0;
var validation_1 = require("./validation");
var aws_signature_v4_1 = require("./aws-signature-v4");
var crypto_1 = __importDefault(require("crypto"));
var StreamingClient_1 = require("./StreamingClient");
var AwsTranscribe = (function () {
    function AwsTranscribe(config) {
        this.setAccessKeyId((config === null || config === void 0 ? void 0 : config.accessKeyId) || process.env.AWS_ACCESS_KEY_ID);
        this.setSecretAccessKey((config === null || config === void 0 ? void 0 : config.secretAccessKey) || process.env.AWS_SECRET_ACCESS_KEY);
    }
    AwsTranscribe.prototype.createPreSignedUrl = function (config) {
        var region = config.region, languageCode = config.languageCode, sampleRate = config.sampleRate;
        var endpoint = "transcribestreaming." + region + ".amazonaws.com:8443";
        return aws_signature_v4_1.createPresignedURL("GET", endpoint, config.specialty ? "/medical-stream-transcription-websocket" : "/stream-transcription-websocket", "transcribe", crypto_1.default.createHash("sha256").update("", "utf8").digest("hex"), {
            key: this.accessKeyId,
            secret: this.secretAccessKey,
            protocol: "wss",
            expires: 15,
            region: region,
            query: "language-code=" + languageCode + "&media-encoding=pcm&sample-rate=" + sampleRate + (config.specialty ? ("&specialty=" + config.specialty) : "") + (config.type ? ("&type=" + config.type) : "") + (config.vocabularyName ? ("&vocabulary-name=" + config.vocabularyName) : ""),
        });
    };
    AwsTranscribe.prototype.createStreamingClient = function (config) {
        var url = this.createPreSignedUrl(config);
        return new StreamingClient_1.StreamingClient(url);
    };
    AwsTranscribe.prototype.setAccessKeyId = function (accessKeyId) {
        if (validation_1.validateIsStringOtherwiseThrow(accessKeyId, "accessKeyId")) {
            this.accessKeyId = accessKeyId;
        }
    };
    AwsTranscribe.prototype.setSecretAccessKey = function (secretAccessKey) {
        if (validation_1.validateIsStringOtherwiseThrow(secretAccessKey, "secretAccessKey")) {
            this.secretAccessKey = secretAccessKey;
        }
    };
    return AwsTranscribe;
}());
exports.AwsTranscribe = AwsTranscribe;
//# sourceMappingURL=AwsTranscribe.js.map