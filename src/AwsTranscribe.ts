import { ClientConfig, TranscribeStreamConfig } from "./types"
import { isString } from "./validation"
import { createPresignedURL } from "./aws-signature-v4"
import crypto from "crypto"

// get from environment if available
const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

export class AwsTranscribe {
    private accessKeyId!: string
    private secretAccessKey!: string

    constructor(config: ClientConfig) {
        this.setConfig(config)
    }

    createPreSignedUrl(config: TranscribeStreamConfig) {
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

    setConfig(config: ClientConfig) {
        this.setAccessKeyId(config.accessKeyId || accessKeyId)
        this.setSecretAccessKey(config.secretAccessKey || secretAccessKey)
    }

    setAccessKeyId(accessKeyId: string | undefined) {
        if (!isString(accessKeyId)) {
            throw new Error(`invalid accessKeyId`)
        }
        this.accessKeyId = accessKeyId
    }

    setSecretAccessKey(secretAccessKey: string | undefined) {
        if (!isString(secretAccessKey)) {
            throw new Error(`invalid secretAccessKey`)
        }
        this.secretAccessKey = secretAccessKey
    }
}
