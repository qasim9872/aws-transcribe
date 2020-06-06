import WebSocket from "ws"
import { Writable } from "stream"

import { createDebugger } from "./utils"
import { TranscribeException } from "./TranscribeException"
import { fromBinary, toBinary } from "./aws-message-utils"
import { TranscriptEvent } from "."

const debugLog = createDebugger(__filename)

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
        this.cork()
    }

    /**
     * @description called when the websocket to aws opens
     */
    private _onopen() {
        debugLog(`opened connection to aws transcribe`)
        this.emit(StreamingClient.EVENTS.OPEN)
        this.uncork()
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
     * @description handles the incoming binary messages from aws and emits the data event or error event
     * @param message
     */
    private _onmessage(message: any) {
        const { wrapper, body } = fromBinary(message)
        debugLog(`wrapper: `, JSON.stringify(wrapper))
        debugLog(`body: `, JSON.stringify(body))

        // message type is event and event type is TranscriptEvent
        if (wrapper.headers[":message-type"].value === "event") {
            const eventType = wrapper.headers[":event-type"].value
            debugLog(`${eventType}: `, body)
            this.emit(StreamingClient.EVENTS.DATA, body as TranscriptEvent, eventType)
        } else {
            // message type is exception
            // exception type is supposed to be one from EXCEPTIONS
            const exceptionType = wrapper.headers[":exception-type"].value as string
            const exceptionMessage = body.Message
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
        const binary = toBinary(chunk)

        this.ws.readyState === 1 && this.ws.send(binary, cb)
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
