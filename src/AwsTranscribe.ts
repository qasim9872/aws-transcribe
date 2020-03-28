import { ClientConfig, TranscribeStreamConfig } from "./types"
import { validateIsStringOtherwiseThrow } from "./validation"
import { createPresignedURL } from "./aws-signature-v4"
import crypto from "crypto"
import { StreamingClient } from "./StreamingClient"

// get from environment if available
const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

export class AwsTranscribe {
    private accessKeyId!: string
    private secretAccessKey!: string

    constructor(config: ClientConfig) {
        this.setConfig(config)
    }

    private createPreSignedUrl(config: TranscribeStreamConfig) {
        const { region, languageCode, sampleRate } = config
        const endpoint = "transcribestreaming." + region + ".amazonaws.com:8443"

        return createPresignedURL(
            "GET",
            endpoint,
            "/stream-transcription-websocket",
            "transcribe",
            crypto.createHash("sha256").update("", "utf8").digest("hex"),
            {
                key: this.accessKeyId,
                secret: this.secretAccessKey,
                // sessionToken: $("#session_token").val(),
                protocol: "wss",
                expires: 15,
                region: region,
                query: "language-code=" + languageCode + "&media-encoding=pcm&sample-rate=" + sampleRate,
            }
        )
    }

    createStreamingClient(config: TranscribeStreamConfig) {
        const url = this.createPreSignedUrl(config)
        return new StreamingClient(url)
    }

    setConfig(config: ClientConfig) {
        this.setAccessKeyId(config.accessKeyId || accessKeyId)
        this.setSecretAccessKey(config.secretAccessKey || secretAccessKey)
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
