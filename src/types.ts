export type AVAILABLE_REGIONS =
    | "us-east-1"
    | "us-east-2"
    | "us-west-2"
    | "ap-southeast-2"
    | "ca-central-1"
    | "eu-west-1"

/**
 * 8 KHz and 16 KHz
 * US English (en-US)
 * US Spanish (es-US)
 * 8 KHz only
 * Australian English (en-AU)
 * British English (en-GB)
 * French (fr-FR)
 * Canadian French (fr-CA)
 */
export type LANGUAGES = "en-US" | "en-AU" | "en-GB" | "fr-CA" | "fr-FR" | "es-US"

export interface ClientConfig {
    accessKeyId?: string
    secretAccessKey?: string
    sessionToken?: string
}

export interface TranscribeStreamConfig {
    region: AVAILABLE_REGIONS
    languageCode: LANGUAGES
    sampleRate: number
}

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

export interface AwsEventMessage {
    headers: {
        ":message-type": {
            type: string
            value: string
        }
        ":event-type": {
            type: string
            value: string
        }
    }
    body: Buffer
}

interface TranscribeItem {
    Content: string
    EndTime: number
    StartTime: number
    Type: "pronunciation" | "punctuation"
}

interface TranscribeAlternative {
    Items: TranscribeItem[]
    Transcript: string
}

interface TranscribeResult {
    Alternatives: TranscribeAlternative[]
    EndTime: number
    IsPartial: boolean
    ResultId: string
    StartTime: number
}

export interface TranscriptEvent {
    Transcript: {
        Results: TranscribeResult[]
    }
}
