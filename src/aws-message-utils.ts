import { EventStreamMarshaller } from "@aws-sdk/eventstream-marshaller" // for converting binary event stream messages to and from JSON
import { toUtf8, fromUtf8 } from "@aws-sdk/util-utf8-node" // utilities for encoding and decoding UTF8
import { getAwsEventMessage } from "./utils"

// our converter between binary event streams messages and JSON
export const eventStreamMarshaller = new EventStreamMarshaller(toUtf8, fromUtf8)
const decoder = (() => {
    const TextDecoder = typeof window !== "undefined" ? window.TextDecoder : require("util").TextDecoder

    return new TextDecoder("utf-8")
})()

/**
 * @description converts a binary message to json
 * @param chunk
 */
export function fromBinary(message: any) {
    // convert the binary event stream message to JSON
    const wrapper = eventStreamMarshaller.unmarshall(Buffer.from(message))

    const body = JSON.parse(decoder.decode(wrapper.body))

    return { wrapper, body }
}

/**
 * @description converts a chunk to binary so it can be sent to AWS
 * @param chunk
 */
export function toBinary(chunk: any) {
    // add the right JSON headers and structure to the message
    const audioEventMessage = getAwsEventMessage(Buffer.from(chunk))

    // convert the JSON object + headers into a binary event stream message
    return eventStreamMarshaller.marshall(audioEventMessage as any)
}
