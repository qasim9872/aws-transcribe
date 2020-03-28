import WebSocket from "ws"
import { Writable } from "stream"

import { EventStreamMarshaller } from "@aws-sdk/eventstream-marshaller" // for converting binary event stream messages to and from JSON
import { toUtf8, fromUtf8 } from "@aws-sdk/util-utf8-node" // utilities for encoding and decoding UTF8
import { TextDecoder } from "util"
import { createDebugger, getAudioEventMessage } from "./utils"
import { TranscribeException } from "./TranscribeException"

const debugLog = createDebugger(__filename)
// our converter between binary event streams messages and JSON
const eventStreamMarshaller = new EventStreamMarshaller(toUtf8, fromUtf8)
const decoder = new TextDecoder("utf-8")

enum STREAM_EVENTS {
    OPEN = "open",
    DATA = "data",
    ERROR = "error",
    CLOSE = "close",
}

export class StreamingClient extends Writable {
    static EVENTS = STREAM_EVENTS

    private url: string
    private ws: WebSocket

    constructor(url: string) {
        super()

        this.url = url
        this.ws = new WebSocket(this.url)

        this.ws.on("open", this._onopen.bind(this))
        this.ws.on("message", this._onmessage.bind(this))
        this.ws.on("error", this._onerror.bind(this))
        this.ws.on("close", this._onclose.bind(this))
    }

    /**
     * @description called when the websocket to aws opens
     */
    private _onopen() {
        debugLog(`opened connection to aws transcribe`)
        this.emit(StreamingClient.EVENTS.OPEN)
    }

    /**
     * @description emits error event
     * @param type - exception type
     * @param message - message explaining the exception
     */
    handleException(exception: Error, type = "error") {
        debugLog(`${type} occurred: `, exception)
        this.emit(StreamingClient.EVENTS.ERROR, exception)
    }

    /**
     *
     * @param message
     */
    private _onmessage(message: any) {
        // convert the binary event stream message to JSON
        const messageWrapper = eventStreamMarshaller.unmarshall(Buffer.from(message))

        // eslint-disable-next-line prefer-spread
        const messageBody = JSON.parse(decoder.decode(messageWrapper.body))
        debugLog(`messageBody: `, JSON.stringify(messageBody))

        // message type is event and event type is TranscriptEvent
        if (messageWrapper.headers[":message-type"].value === "event") {
            debugLog(`event: `, messageBody)
        } else {
            // message type is exception
            // exception type is supposed to be one from EXCEPTIONS
            const exceptionType = messageWrapper.headers[":exception-type"].value as string
            const exceptionMessage = messageBody.Message
            this.handleException(new TranscribeException(exceptionType, exceptionMessage), "exception")
        }
    }

    /**
     * @description this will be called when an error occurs on the websocket
     * @param {*} error
     */
    private _onerror(error: Error) {
        debugLog("error occurred on aws transcribe connection", error)
        this.handleException(error)
    }

    /**
     * @description this will be called when the websocket is closed
     * @param {*} code - close code
     * @param {*} reason - reason for the close
     */
    private _onclose(code: number, reason: string) {
        debugLog(`closed connection to aws transcribe`, { code, reason })
        this.emit(StreamingClient.EVENTS.CLOSE, code, reason)
    }

    /**
     * @description The stream write function which is used internally so data can be piped to this stream.
     * It is then wrapped in the correct format and converted to a binary message
     * @param chunk - chunk to send
     * @param _
     * @param cb - to be triggered after processing the message
     */
    _write(chunk: any, _: string, cb: any) {
        // add the right JSON headers and structure to the message
        const audioEventMessage = getAudioEventMessage(Buffer.from(chunk))

        // convert the JSON object + headers into a binary event stream message
        const binary = eventStreamMarshaller.marshall(audioEventMessage as any)

        this.ws.readyState === 1 && this.ws.send(binary)
        cb()
    }

    /**
     * @description destroys the websocket connection and calls the stream destroy method
     */
    destroy() {
        super.destroy()
        if (this.ws) {
            this.ws.removeAllListeners()
            this.ws.readyState === 1 && this.ws.close(1000)
        }
    }
}
