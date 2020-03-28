import WebSocket from "ws"
import { Writable } from "stream"

import { createDebugger } from "./utils"
import { EventStreamMarshaller } from "@aws-sdk/eventstream-marshaller" // for converting binary event stream messages to and from JSON
import { toUtf8, fromUtf8 } from "@aws-sdk/util-utf8-node" // utilities for encoding and decoding UTF8

const debugLog = createDebugger(__filename)
// our converter between binary event streams messages and JSON
const eventStreamMarshaller = new EventStreamMarshaller(toUtf8, fromUtf8)

export class StreamingClient extends Writable {
    private url: string
    private ws!: WebSocket

    constructor(url: string) {
        super()
        this.url = url

        this.connect()
    }

    connect() {
        this.ws = new WebSocket(this.url)

        this.ws.on("open", this._onopen.bind(this))
        this.ws.on("message", this._onmessage.bind(this))
        this.ws.on("error", this._onerror.bind(this))
        this.ws.on("close", this._onclose.bind(this))
    }

    _onopen() {
        debugLog(`opened connection to aws transcribe`)
    }

    _onmessage(message: any) {
        debugLog(`message received from aws transcribe`, message)
        //convert the binary event stream message to JSON
        const messageWrapper = eventStreamMarshaller.unmarshall(Buffer.from(message))
        debugLog(`un-marshalled message`, messageWrapper)

        // eslint-disable-next-line prefer-spread
        const messageBody = JSON.parse(String.fromCharCode.apply(String, messageWrapper.body as any))
        if (messageWrapper.headers[":message-type"].value === "event") {
            debugLog(`event: `, messageBody)
        } else {
            const error = messageBody.Message
            debugLog(`error: `, messageBody.Message)
            this.emit("error", new Error(error))
        }
    }

    /**
     * @description this will be called when an error occurs on the websocket
     * @param {*} error
     */
    _onerror(error: Error) {
        debugLog("error occurred on aws transcribe connection", error)
    }

    /**
     * @description this will be called when the websocket is closed
     * @param {*} error
     */
    _onclose(code: number, reason: string) {
        debugLog(`closed connection to aws transcribe`, { code, reason })
    }
}
