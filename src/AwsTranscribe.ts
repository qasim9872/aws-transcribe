import { ClientConfig, TranscribeStreamConfig } from "./types"
import { validateIsStringOtherwiseThrow } from "./validation"
import { createPresignedURL } from "./aws-signature-v4"
import crypto from "crypto"
import { StreamingClient } from "./StreamingClient"

export class AwsTranscribe {
    private accessKeyId!: string
    private secretAccessKey!: string
    private sessionToken: string | undefined

    constructor(config?: ClientConfig) {
        // get from environment if config not provided
        this.setAccessKeyId(config?.accessKeyId || process.env.AWS_ACCESS_KEY_ID)
        this.setSecretAccessKey(config?.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY)
        this.setSessionToken(config?.sessionToken || process.env.AWS_SESSION_TOKEN)
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
                sessionToken: this.sessionToken,
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

    setSessionToken(sessionToken: string | undefined) {
      this.sessionToken = sessionToken
    }
}
