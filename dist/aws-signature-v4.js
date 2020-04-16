"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = __importDefault(require("crypto"));
var query_string_1 = __importDefault(require("query-string"));
function toTime(time) {
    return new Date(time).toISOString().replace(/[:\-]|\.\d{3}/g, "");
}
function toDate(time) {
    return toTime(time).substring(0, 8);
}
function hmac(key, string, encoding) {
    return crypto_1.default
        .createHmac("sha256", key)
        .update(string, "utf8")
        .digest(encoding);
}
function hash(string, encoding) {
    return crypto_1.default.createHash("sha256").update(string, "utf8").digest(encoding);
}
function createCanonicalQueryString(params) {
    return Object.keys(params)
        .sort()
        .map(function (key) {
        return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]);
    })
        .join("&");
}
exports.createCanonicalQueryString = createCanonicalQueryString;
function createCanonicalHeaders(headers) {
    return Object.keys(headers)
        .sort()
        .map(function (name) {
        return name.toLowerCase().trim() + ":" + headers[name].toString().trim() + "\n";
    })
        .join("");
}
exports.createCanonicalHeaders = createCanonicalHeaders;
function createSignedHeaders(headers) {
    return Object.keys(headers)
        .sort()
        .map(function (name) {
        return name.toLowerCase().trim();
    })
        .join(";");
}
exports.createSignedHeaders = createSignedHeaders;
function createCanonicalRequest(method, pathname, query, headers, payload) {
    return [
        method.toUpperCase(),
        pathname,
        createCanonicalQueryString(query),
        createCanonicalHeaders(headers),
        createSignedHeaders(headers),
        payload,
    ].join("\n");
}
exports.createCanonicalRequest = createCanonicalRequest;
function createCredentialScope(time, region, service) {
    return [toDate(time), region, service, "aws4_request"].join("/");
}
exports.createCredentialScope = createCredentialScope;
function createStringToSign(time, region, service, request) {
    return ["AWS4-HMAC-SHA256", toTime(time), createCredentialScope(time, region, service), hash(request, "hex")].join("\n");
}
exports.createStringToSign = createStringToSign;
function createSignature(secret, time, region, service, stringToSign) {
    var h1 = hmac("AWS4" + secret, toDate(time));
    var h2 = hmac(h1, region);
    var h3 = hmac(h2, service);
    var h4 = hmac(h3, "aws4_request");
    return hmac(h4, stringToSign, "hex");
}
exports.createSignature = createSignature;
function createPresignedURL(method, host, path, service, payload, options) {
    options = options || {};
    options.key = options.key;
    options.secret = options.secret;
    options.protocol = options.protocol || "https";
    options.headers = options.headers || { Host: host };
    options.timestamp = options.timestamp || Date.now();
    options.region = options.region || process.env.AWS_REGION || "us-east-1";
    options.expires = options.expires || 86400;
    var query = options.query ? query_string_1.default.parse(options.query) : {};
    query["X-Amz-Algorithm"] = "AWS4-HMAC-SHA256";
    query["X-Amz-Credential"] = options.key + "/" + createCredentialScope(options.timestamp, options.region, service);
    query["X-Amz-Date"] = toTime(options.timestamp);
    query["X-Amz-Expires"] = options.expires;
    query["X-Amz-SignedHeaders"] = createSignedHeaders(options.headers);
    if (options.sessionToken) {
        query["X-Amz-Security-Token"] = options.sessionToken;
    }
    var canonicalRequest = createCanonicalRequest(method, path, query, options.headers, payload);
    var stringToSign = createStringToSign(options.timestamp, options.region, service, canonicalRequest);
    var signature = createSignature(options.secret, options.timestamp, options.region, service, stringToSign);
    query["X-Amz-Signature"] = signature;
    return options.protocol + "://" + host + path + "?" + query_string_1.default.stringify(query);
}
exports.createPresignedURL = createPresignedURL;
//# sourceMappingURL=aws-signature-v4.js.map