import { TextEncoder } from "util"
import { eventStreamMarshaller } from "../aws-message-utils"

const encoder = new TextEncoder()

function getAwsExceptionMessage(exceptionType: string, body: Uint8Array) {
    return {
        headers: {
            ":exception-type": { type: "string", value: exceptionType },
            ":content-type": { type: "string", value: "application/json" },
            ":message-type": { type: "string", value: "exception" },
        },
        body,
    }
}

export function getBinaryException(exceptionType: string, rawBody: any) {
    const stringifiedBody = typeof rawBody === "string" ? rawBody : JSON.stringify(rawBody)
    const encodedBody = encoder.encode(stringifiedBody)

    const message = getAwsExceptionMessage(exceptionType, encodedBody)
    return eventStreamMarshaller.marshall(message as any)
}

export function createBodyForExceptionEvent(message: string) {
    return {
        Message: message,
    }
}

function getAwsEventMessage(eventType: string, body: Uint8Array) {
    return {
        headers: {
            ":event-type": { type: "string", value: eventType },
            ":content-type": { type: "string", value: "application/json" },
            ":message-type": { type: "string", value: "event" },
        },
        body,
    }
}

export function getBinaryEvent(eventType: string, rawBody: any) {
    const stringifiedBody = typeof rawBody === "string" ? rawBody : JSON.stringify(rawBody)
    const encodedBody = encoder.encode(stringifiedBody)

    const message = getAwsEventMessage(eventType, encodedBody)
    return eventStreamMarshaller.marshall(message as any)
}

export function createBodyForTranscriptionEvent(transcript: string, isPartial: boolean) {
    return {
        Transcript: {
            Results: [
                {
                    Alternatives: [
                        {
                            Items: [],
                            Transcript: transcript,
                        },
                    ],
                    EndTime: 24.6,
                    IsPartial: isPartial,
                    ResultId: "de273780-deb3-4352-916e-63f30c4fbdfa",
                    StartTime: 23.55,
                },
            ],
        },
    }
}
