import WebSocket from "ws"
import { Writable } from "stream"

import { createDebugger, getAudioEventMessage } from "./utils"
import { EventStreamMarshaller } from "@aws-sdk/eventstream-marshaller" // for converting binary event stream messages to and from JSON
import { toUtf8, fromUtf8 } from "@aws-sdk/util-utf8-node" // utilities for encoding and decoding UTF8

const debugLog = createDebugger(__filename)
// our converter between binary event streams messages and JSON
const eventStreamMarshaller = new EventStreamMarshaller(toUtf8, fromUtf8)

// Exceptions described in the AWS documentation
// https://docs.aws.amazon.com/transcribe/latest/dg/websocket.html#websocket-errors
enum EXCEPTIONS {
    BadRequestException = "BadRequestException",
    InternalFailureException = "InternalFailureException",
    LimitExceededException = "LimitExceededException",
    UnrecognizedClientException = "UnrecognizedClientException",
}

// Map the exception to the description which can be sent to the user
const EXCEPTIONS_MAP: { [key in EXCEPTIONS]: string } = {
    [EXCEPTIONS.BadRequestException]:
        "There was a client error when the stream was created, or an error occurred while streaming data. Make sure that your client is ready to accept data and try your request again.",
    [EXCEPTIONS.InternalFailureException]:
        "Amazon Transcribe had a problem during the handshake with the client. Try your request again.",
    [EXCEPTIONS.LimitExceededException]:
        "The client exceeded the concurrent stream limit. For more information, see Amazon Transcribe Limits in the Amazon Web Services General Reference. Reduce the number of streams that you are transcribing.",
    [EXCEPTIONS.UnrecognizedClientException]:
        "The WebSocket upgrade request was signed with an incorrect access key or secret key. Make sure that you are correctly creating the access key and try your request again.",
}

export class StreamingClient extends Writable {
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
    _onopen() {
        debugLog(`opened connection to aws transcribe`)
    }

    /**
     *
     * @param message
     */
    _onmessage(message: any) {
        debugLog(`message received from aws transcribe`, message)
        //convert the binary event stream message to JSON
        const messageWrapper = eventStreamMarshaller.unmarshall(Buffer.from(message))

        // eslint-disable-next-line prefer-spread
        const messageBody = JSON.parse(String.fromCharCode.apply(String, messageWrapper.body as any))
        debugLog(`messageBody: `, JSON.stringify(messageBody))

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
     * @param {*} code - close code
     * @param {*} reason - reason for the close
     */
    _onclose(code: number, reason: string) {
        debugLog(`closed connection to aws transcribe`, { code, reason })
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
