import { ClientConfig, TranscribeStreamConfig } from "./types";
import { StreamingClient } from "./StreamingClient";
export declare class AwsTranscribe {
    private accessKeyId;
    private secretAccessKey;
    private sessionToken;
    constructor(config?: ClientConfig);
    private createPreSignedUrl;
    createStreamingClient(config: TranscribeStreamConfig): StreamingClient;
    setAccessKeyId(accessKeyId: string | undefined): void;
    setSecretAccessKey(secretAccessKey: string | undefined): void;
    setSessionToken(sessionToken: string | undefined): void;
}
