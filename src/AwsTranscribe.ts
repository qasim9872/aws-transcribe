import { ClientConfig, TranscribeStreamConfig } from "./types"
import { validateIsStringOtherwiseThrow } from "./validation"
import { createPresignedURL } from "./aws-signature-v4"
import crypto from "crypto"
import { StreamingClient } from "./StreamingClient"

export class AwsTranscribe {
    private accessKeyId!: string
    private secretAccessKey!: string

    constructor(config?: ClientConfig) {
        // get from environment if config not provided
        this.setAccessKeyId(config?.accessKeyId || process.env.AWS_ACCESS_KEY_ID)
        this.setSecretAccessKey(config?.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY)
    }

    private createPreSignedUrl(config: TranscribeStreamConfig) {
        const { region, languageCode, sampleRate } = config
        const endpoint = "transcribestreaming." + region + ".amazonaws.com:8443"

        return createPresignedURL(
            "GET",
            endpoint,
            config.specialty ? "/medical-stream-transcription-websocket" : "/stream-transcription-websocket",
            "transcribe",
            crypto.createHash("sha256").update("", "utf8").digest("hex"),
            {
                key: this.accessKeyId,
                secret: this.secretAccessKey,
                protocol: "wss",
                expires: 15,
                region: region,
                query: "language-code=" + languageCode + "&media-encoding=pcm&sample-rate=" + sampleRate + (config.specialty ? ("&specialty=" + config.specialty) : "") + (config.type ? ("&type=" + config.type) : "") + (config.vocabularyName ? ("&vocabulary-name=" + config.vocabularyName) : ""),
            }
        )
    }

    createStreamingClient(config: TranscribeStreamConfig) {
        const url = this.createPreSignedUrl(config)
        return new StreamingClient(url)
    }

    setAccessKeyId(accessKeyId: string | undefined) {
        if (validateIsStringOtherwiseThrow(accessKeyId, "accessKeyId")) {
            this.accessKeyId = accessKeyId
        }
    }

    setSecretAccessKey(secretAccessKey: string | undefined) {
        if (validateIsStringOtherwiseThrow(secretAccessKey, "secretAccessKey")) {
            this.secretAccessKey = secretAccessKey
        }
    }
}
