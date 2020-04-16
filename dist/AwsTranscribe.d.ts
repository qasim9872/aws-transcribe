import { ClientConfig, TranscribeStreamConfig } from "./types";
import { StreamingClient } from "./StreamingClient";
export declare class AwsTranscribe {
    private accessKeyId;
    private secretAccessKey;
    constructor(config?: ClientConfig);
    private createPreSignedUrl;
    createStreamingClient(config: TranscribeStreamConfig): StreamingClient;
    setAccessKeyId(accessKeyId: string | undefined): void;
    setSecretAccessKey(secretAccessKey: string | undefined): void;
}
