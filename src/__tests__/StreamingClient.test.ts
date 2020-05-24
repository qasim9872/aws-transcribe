jest.mock("ws")

import WsServer from "jest-websocket-mock"
import { StreamingClient, TranscriptEvent } from "../index"
import { TranscribeException } from "../TranscribeException"
import {
    getBinaryEvent,
    getReadableStream,
    getBinaryException,
    getObjectFromBinary,
    createBodyForTranscriptionEvent,
    createBodyForExceptionEvent,
} from "./utils"
import { mocked } from "ts-jest/utils"

function waitForEvent(event: string, streamClient: StreamingClient): Promise<any> {
    return new Promise((resolve) => {
        streamClient.on(event, resolve)
    })
}

describe("StreamingClient", () => {
    const url = `ws://localhost:12000`
    let server: WsServer

    beforeEach(async () => {
        server = new WsServer(url, { jsonProtocol: false })
    })

    afterEach(() => {
        // clean up
        WsServer.clean()
    })

    describe("new StreamingClient()", () => {
        let client: StreamingClient

        beforeEach(() => {
            client = new StreamingClient(url)
        })

        it(`should connect to the server and emit the open event`, async () => {
            await waitForEvent(StreamingClient.EVENTS.OPEN, client)
        })

        describe("Opened connection", () => {
            beforeEach(async () => {
                // ensures the connection is open before we run any more tests
                await waitForEvent(StreamingClient.EVENTS.OPEN, client)
            })

            it(`should emit close event with code and reason when the socket connection closes`, () => {
                const closeCode = 1000
                const closeReason = `testing close event`
                expect.assertions(4)
                waitForEvent(StreamingClient.EVENTS.CLOSE, client).then((event) => {
                    const { code, reason } = event
                    expect(code).toBeDefined()
                    expect(code).toBe(closeCode)
                    expect(reason).toBeDefined()
                    expect(reason).toBe(closeReason)
                })
                server.close({
                    code: closeCode,
                    reason: closeReason,
                    wasClean: true,
                })
            })

            it(`should emit error event with the error if socket emits an error`, () => {
                expect.assertions(1)
                waitForEvent(StreamingClient.EVENTS.ERROR, client).then((error) => {
                    expect(error.type).toBe("error")
                })
                server.error()
            })

            describe("on message event - should convert the message to json", () => {
                it(`emit data event with json and event name`, (done) => {
                    const body = createBodyForTranscriptionEvent(`a random transcription`, false)
                    const event = "TranscriptionEvent"
                    const message = getBinaryEvent(event, body)
                    client.on(StreamingClient.EVENTS.DATA, (data: TranscriptEvent, eventName: string) => {
                        expect(data).toEqual(body)
                        expect(eventName).toBe(event)
                        done()
                    })
                    // call the _onmessage directly since the mock-socket doesn't seem to handle the binary data properly
                    client["_onmessage"](message)
                })

                it(`emit error event with Custom error`, (done) => {
                    const messageString = "bad request exception"
                    const body = createBodyForExceptionEvent(messageString)
                    const event = TranscribeException.EXCEPTION.BadRequestException
                    const message = getBinaryException(event, body)
                    client.on(StreamingClient.EVENTS.ERROR, (error: TranscribeException) => {
                        expect(error).toBeDefined()
                        expect(error.message).toBe(messageString)
                        expect(error.type).toBe(event)
                        expect(error.description).toBe(TranscribeException.EXCEPTIONS_MAP.BadRequestException)
                        done()
                    })
                    // call the _onmessage directly since the mock-socket doesn't seem to handle the binary data properly
                    client["_onmessage"](message)
                })

                it(`emit error event with Custom error and default description if type is not known`, (done) => {
                    const messageString = "unknown request exception"
                    const body = createBodyForExceptionEvent(messageString)
                    const event = "unknown error"
                    const message = getBinaryException(event, body)
                    client.on(StreamingClient.EVENTS.ERROR, (error: TranscribeException) => {
                        expect(error).toBeDefined()
                        expect(error.message).toBe(messageString)
                        expect(error.type).toBe(event)
                        expect(error.description).toBe("no description available for this exception type")
                        done()
                    })
                    // call the _onmessage directly since the mock-socket doesn't seem to handle the binary data properly
                    client["_onmessage"](message)
                })
            })

            describe("sending data", () => {
                it(`should wrap data that's coming on the stream and send it using the websocket`, (done) => {
                    const stream = getReadableStream(true)
                    const audioBuffer = Buffer.alloc(500).fill(0xff)
                    const ws = client["ws"]

                    ws.readyState = 1
                    ws.send = jest.fn()
                    const mockedSend = mocked(ws.send, true)

                    stream.pipe(client)
                    stream.push(audioBuffer)

                    // add delay before checking so the stream is able to trigger the write function
                    setTimeout(() => {
                        expect(ws.send).toBeCalled()
                        const binary = mockedSend.mock.calls[0][0]
                        const data = getObjectFromBinary(binary)
                        expect(data.headers).toEqual({
                            ":event-type": {
                                type: "string",
                                value: "AudioEvent",
                            },
                            ":message-type": {
                                type: "string",
                                value: "event",
                            },
                        })
                        done()
                    }, 1000)
                })
            })

            describe("destroy()", () => {
                it(`should close the ws connection`, () => {
                    const ws = client["ws"]
                    ws.close = jest.fn()
                    ws.removeAllListeners = jest.fn()
                    const mockedClose = mocked(ws.close, true)

                    client.destroy()
                    expect(mockedClose).toBeCalled()
                })
            })
        })
    })
})
