// EXCEPTION described in the AWS documentation
// https://docs.aws.amazon.com/transcribe/latest/dg/websocket.html#websocket-errors
enum EXCEPTION {
    BadRequestException = "BadRequestException",
    InternalFailureException = "InternalFailureException",
    LimitExceededException = "LimitExceededException",
    UnrecognizedClientException = "UnrecognizedClientException",
}

// Map the exception to the description which can be sent to the user
const EXCEPTIONS_MAP: { [key in EXCEPTION]: string } = {
    [EXCEPTION.BadRequestException]:
        "There was a client error when the stream was created, or an error occurred while streaming data. Make sure that your client is ready to accept data and try your request again.",
    [EXCEPTION.InternalFailureException]:
        "Amazon Transcribe had a problem during the handshake with the client. Try your request again.",
    [EXCEPTION.LimitExceededException]:
        "The client exceeded the concurrent stream limit. For more information, see Amazon Transcribe Limits in the Amazon Web Services General Reference. Reduce the number of streams that you are transcribing.",
    [EXCEPTION.UnrecognizedClientException]:
        "The WebSocket upgrade request was signed with an incorrect access key or secret key. Make sure that you are correctly creating the access key and try your request again.",
}

export class TranscribeException extends Error {
    static EXCEPTION = EXCEPTION
    static EXCEPTIONS_MAP = EXCEPTIONS_MAP
    static isException(type: any): type is EXCEPTION {
        return Object.values(EXCEPTION).includes(type)
    }

    type: EXCEPTION | string
    description: string

    constructor(type: string, message: string) {
        super(message)
        this.type = type
        this.description = TranscribeException.isException(type)
            ? EXCEPTIONS_MAP[type]
            : "no description available for this exception type"
    }
}
