import debug from "debug"

function extractNameFromPath(filePath: string): string {
    const extractedName = filePath.match(/.*\/(.*)\./)
    return extractedName ? extractedName[1] : filePath
}

export function createDebugger(filePath: string) {
    const name = extractNameFromPath(filePath)
    return debug(`aws-transcribe:${name}`)
}

/**
 * @description wrap the audio data in a JSON envelope for AWS
 * @param buffer - buffer to use as the message body
 */
export function getAudioEventMessage(buffer: Buffer) {
    return {
        headers: {
            ":message-type": {
                type: "string",
                value: "event",
            },
            ":event-type": {
                type: "string",
                value: "AudioEvent",
            },
        },
        body: buffer,
    }
}
