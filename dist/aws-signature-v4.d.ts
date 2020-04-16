import { AVAILABLE_REGIONS, PresignedUrlOptions, PresignedUrlHeaders, PresignedUrlQuery } from "./types";
export declare function createCanonicalQueryString(params: PresignedUrlQuery): string;
export declare function createCanonicalHeaders(headers: PresignedUrlHeaders): string;
export declare function createSignedHeaders(headers: PresignedUrlHeaders): string;
export declare function createCanonicalRequest(method: string, pathname: string, query: PresignedUrlQuery, headers: PresignedUrlHeaders, payload: string): string;
export declare function createCredentialScope(time: number, region: AVAILABLE_REGIONS, service: string): string;
export declare function createStringToSign(time: number, region: AVAILABLE_REGIONS, service: string, request: string): string;
export declare function createSignature(secret: string, time: number, region: AVAILABLE_REGIONS, service: string, stringToSign: string): string;
export declare function createPresignedURL(method: string, host: string, path: string, service: string, payload: string, options: PresignedUrlOptions): string;
