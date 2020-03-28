// Copied from https://github.com/aws-samples/amazon-transcribe-websocket-static/blob/master/lib/aws-signature-v4.js
// and converted to typescript
"use strict"

import crypto, { HexBase64Latin1Encoding } from "crypto"
import querystring from "query-string"
import { AVAILABLE_REGIONS, PresignedUrlOptions, PresignedUrlHeaders, PresignedUrlQuery } from "./types"

function toTime(time: string | number | Date) {
    return new Date(time).toISOString().replace(/[:\-]|\.\d{3}/g, "")
}

function toDate(time: string | number) {
    return toTime(time).substring(0, 8)
}

function hmac(key: string, string: string, encoding?: HexBase64Latin1Encoding) {
    return crypto
        .createHmac("sha256", key)
        .update(string, "utf8")
        .digest(encoding as any)
}

function hash(string: string, encoding: HexBase64Latin1Encoding) {
    return crypto.createHash("sha256").update(string, "utf8").digest(encoding)
}

export function createCanonicalQueryString(params: PresignedUrlQuery) {
    return Object.keys(params)
        .sort()
        .map(function (key) {
            return encodeURIComponent(key) + "=" + encodeURIComponent(params[key])
        })
        .join("&")
}

export function createCanonicalHeaders(headers: PresignedUrlHeaders) {
    return Object.keys(headers)
        .sort()
        .map(function (name) {
            return name.toLowerCase().trim() + ":" + headers[name].toString().trim() + "\n"
        })
        .join("")
}

export function createSignedHeaders(headers: PresignedUrlHeaders) {
    return Object.keys(headers)
        .sort()
        .map(function (name) {
            return name.toLowerCase().trim()
        })
        .join(";")
}

export function createCanonicalRequest(
    method: string,
    pathname: string,
    query: PresignedUrlQuery,
    headers: PresignedUrlHeaders,
    payload: string
) {
    return [
        method.toUpperCase(),
        pathname,
        createCanonicalQueryString(query),
        createCanonicalHeaders(headers),
        createSignedHeaders(headers),
        payload,
    ].join("\n")
}

export function createCredentialScope(time: number, region: AVAILABLE_REGIONS, service: string) {
    return [toDate(time), region, service, "aws4_request"].join("/")
}

export function createStringToSign(time: number, region: AVAILABLE_REGIONS, service: string, request: string) {
    return ["AWS4-HMAC-SHA256", toTime(time), createCredentialScope(time, region, service), hash(request, "hex")].join(
        "\n"
    )
}

export function createSignature(
    secret: string,
    time: number,
    region: AVAILABLE_REGIONS,
    service: string,
    stringToSign: string
) {
    const h1 = hmac("AWS4" + secret, toDate(time)) // date-key
    const h2 = hmac(h1, region) // region-key
    const h3 = hmac(h2, service) // service-key
    const h4 = hmac(h3, "aws4_request") // signing-key
    return hmac(h4, stringToSign, "hex")
}

export function createPresignedURL(
    method: string,
    host: string,
    path: string,
    service: string,
    payload: string,
    options: PresignedUrlOptions
) {
    options = options || {}
    options.key = options.key
    options.secret = options.secret
    options.protocol = options.protocol || "https"

    // host is required
    options.headers = options.headers || { Host: host }
    options.timestamp = options.timestamp || Date.now()
    options.region = options.region || process.env.AWS_REGION || "us-east-1"
    options.expires = options.expires || 86400 // 24 hours

    const query: PresignedUrlQuery = options.query ? querystring.parse(options.query) : {}
    query["X-Amz-Algorithm"] = "AWS4-HMAC-SHA256"
    query["X-Amz-Credential"] = options.key + "/" + createCredentialScope(options.timestamp, options.region, service)
    query["X-Amz-Date"] = toTime(options.timestamp)
    query["X-Amz-Expires"] = options.expires
    query["X-Amz-SignedHeaders"] = createSignedHeaders(options.headers)
    if (options.sessionToken) {
        query["X-Amz-Security-Token"] = options.sessionToken
    }

    const canonicalRequest = createCanonicalRequest(method, path, query, options.headers, payload)
    const stringToSign = createStringToSign(options.timestamp, options.region, service, canonicalRequest)
    const signature = createSignature(options.secret, options.timestamp, options.region, service, stringToSign)
    query["X-Amz-Signature"] = signature
    return options.protocol + "://" + host + path + "?" + querystring.stringify(query)
}
