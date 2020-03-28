declare module "aws-signature-v4" {
    export type AVAILABLE_REGIONS =
        | "us-east-1"
        | "us-east-2"
        | "us-west-2"
        | "ap-southeast-2"
        | "ca-central-1"
        | "eu-west-1"

    export interface PresignedUrlHeaders {
        [key: string]: any
        Host: string
    }

    export interface PresignedUrlQuery {
        [key: string]: any
        "X-Amz-Algorithm"?: string
        "X-Amz-Credential"?: string
        "X-Amz-Date"?: string
        "X-Amz-Expires"?: number
        "X-Amz-SignedHeaders"?: string
        "X-Amz-Signature"?: string
        "X-Amz-Security-Token"?: string
    }

    export interface PresignedUrlOptions {
        key: string
        secret: string
        sessionToken?: string
        protocol: string
        headers?: PresignedUrlHeaders
        timestamp?: number
        region: AVAILABLE_REGIONS
        expires: number
        query: string
    }

    export function createCanonicalQueryString(params: PresignedUrlQuery): string
    export function createCanonicalHeaders(headers: PresignedUrlHeaders): string
    export function createSignedHeaders(headers: PresignedUrlHeaders): string
    export function createCanonicalRequest(
        method: string,
        pathname: string,
        query: PresignedUrlQuery,
        headers: PresignedUrlHeaders,
        payload: string
    ): string
    export function createCredentialScope(time: number, region: AVAILABLE_REGIONS, service: string): string
    export function createStringToSign(
        time: number,
        region: AVAILABLE_REGIONS,
        service: string,
        request: string
    ): string
    export function createSignature(
        secret: string,
        time: number,
        region: AVAILABLE_REGIONS,
        service: string,
        stringToSign: string
    ): string
    export function createPresignedURL(
        method: string,
        host: string,
        path: string,
        service: string,
        payload: string,
        options: PresignedUrlOptions
    ): string
}
