/// <reference types="node" />
export declare type AVAILABLE_REGIONS = "us-east-1" | "us-east-2" | "us-west-2" | "ap-southeast-2" | "ca-central-1" | "eu-west-1";
export declare type LANGUAGES = "en-US" | "en-AU" | "en-GB" | "fr-CA" | "fr-FR" | "es-US";
export declare type SPECIALTY = "PRIMARYCARE";
export declare type TYPE = "CONVERSATION" | "DICTATION";
export interface ClientConfig {
    accessKeyId?: string;
    secretAccessKey?: string;
}
export interface TranscribeStreamConfig {
    region: AVAILABLE_REGIONS;
    languageCode: LANGUAGES;
    sampleRate: number;
    specialty?: SPECIALTY;
    type?: TYPE;
    vocabularyName?: string;
}
export interface PresignedUrlHeaders {
    [key: string]: any;
    Host: string;
}
export interface PresignedUrlQuery {
    [key: string]: any;
    "X-Amz-Algorithm"?: string;
    "X-Amz-Credential"?: string;
    "X-Amz-Date"?: string;
    "X-Amz-Expires"?: number;
    "X-Amz-SignedHeaders"?: string;
    "X-Amz-Signature"?: string;
    "X-Amz-Security-Token"?: string;
}
export interface PresignedUrlOptions {
    key: string;
    secret: string;
    sessionToken?: string;
    protocol: string;
    headers?: PresignedUrlHeaders;
    timestamp?: number;
    region: AVAILABLE_REGIONS;
    expires: number;
    query: string;
}
export interface AwsEventMessage {
    headers: {
        ":message-type": {
            type: string;
            value: string;
        };
        ":event-type": {
            type: string;
            value: string;
        };
    };
    body: Buffer;
}
