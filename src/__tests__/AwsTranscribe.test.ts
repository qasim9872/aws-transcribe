jest.mock("../StreamingClient")
jest.mock("../aws-signature-v4")

import { AwsTranscribe } from "../index"
import { createPresignedURL } from "../aws-signature-v4"

import { mocked } from "ts-jest/utils"
import { StreamingClient } from "../index"

const mockedStreamingClient = mocked(StreamingClient, true)
const mockedCreatePresignedURL = mocked(createPresignedURL, true)

describe("AwsTranscribe", () => {
    describe("new AwsTranscribe()", () => {
        const OLD_ENV = process.env

        // clean up after the values are set to ensure the other tests aren't affected
        beforeEach(() => {
            jest.resetModules() // this is important - it clears the cache
            process.env = { ...OLD_ENV }
            delete process.env.AWS_ACCESS_KEY_ID
            delete process.env.AWS_SECRET_ACCESS_KEY
        })

        describe("Config from environment", () => {
            it(`should use the accessKeyId and secretAccessKey from the environment if none are provided`, () => {
                const accessKey = "access"
                const secretKey = "secret"

                process.env.AWS_ACCESS_KEY_ID = accessKey
                process.env.AWS_SECRET_ACCESS_KEY = secretKey

                const client = new AwsTranscribe()
                expect(client["accessKeyId"]).toBeDefined()
                expect(client["accessKeyId"]).toBe(accessKey)
                expect(client["secretAccessKey"]).toBeDefined()
                expect(client["secretAccessKey"]).toBe(secretKey)
            })
        })

        describe("Config from argument", () => {
            it(`should use the accessKeyId and secretAccessKey from the config argument`, () => {
                const accessKeyId = "access-config"
                const secretAccessKey = "secret-config"

                const client = new AwsTranscribe({ accessKeyId, secretAccessKey })

                expect(client["accessKeyId"]).toBeDefined()
                expect(client["accessKeyId"]).toBe(accessKeyId)
                expect(client["secretAccessKey"]).toBeDefined()
                expect(client["secretAccessKey"]).toBe(secretAccessKey)
            })
        })

        describe("No Config", () => {
            it(`should throw error if access key id not provided or set in environment`, () => {
                const key = "accessKeyId"
                const errorMessage = `${key} is not defined. it needs to be set in the environment or explicitly passed in the config`

                const wrapper = () => new AwsTranscribe()

                expect(wrapper).toThrowError(new Error(errorMessage))
            })

            it(`should throw error if secret key is not provided or set in environment`, () => {
                const accessKeyId = "accessKeyId-only"
                const key = "secretAccessKey"
                const errorMessage = `${key} is not defined. it needs to be set in the environment or explicitly passed in the config`

                const wrapper = () => new AwsTranscribe({ accessKeyId })

                expect(wrapper).toThrowError(new Error(errorMessage))
            })
        })
    })

    describe("createStreamingClient()", () => {
        let client: AwsTranscribe
        const accessKeyId = "access-config"
        const secretAccessKey = "secret-config"

        beforeEach(() => {
            client = new AwsTranscribe({ accessKeyId, secretAccessKey })
            mockedStreamingClient.mockReset()
            mockedCreatePresignedURL.mockReset()
        })

        it(`should create a pre signed url using the values given and defaults`, () => {
            const region = "us-east-1"
            const sampleRate = 8000
            const languageCode = "en-GB"

            client.createStreamingClient({
                region,
                sampleRate,
                languageCode,
            })

            expect(mockedCreatePresignedURL).toBeCalled()
            const args = mockedCreatePresignedURL.mock.calls[0]

            const method = args[0]
            const url = args[1]
            const path = args[2]
            const service = args[3]
            const payload = args[4] // payload is created by: crypto.createHash("sha256").update("", "utf8").digest("hex")
            const options = args[5]

            expect(method).toBe("GET")
            expect(url).toBe(`transcribestreaming.${region}.amazonaws.com:8443`)
            expect(path).toBe("/stream-transcription-websocket")
            expect(service).toBe("transcribe")

            expect(payload).toBeDefined()
            expect(options).toBeDefined()

            expect(options).toEqual({
                expires: 15,
                key: accessKeyId,
                protocol: "wss",
                query: `language-code=${languageCode}&media-encoding=pcm&sample-rate=${sampleRate}`,
                region,
                secret: secretAccessKey,
            })
        })

        it(`should create and return an instance of Streaming client with the pre signed url`, () => {
            const region = "us-east-1"
            const sampleRate = 8000
            const languageCode = "en-GB"

            const url = `wss://some-random-url`
            mockedCreatePresignedURL.mockImplementationOnce(() => url)

            client.createStreamingClient({
                region,
                sampleRate,
                languageCode,
            })

            expect(mockedStreamingClient).toBeCalled()
            const urlArg = mockedStreamingClient.mock.calls[0][0]

            expect(urlArg).toBeDefined()
            expect(urlArg).toBe(url)
        })
    })
})
