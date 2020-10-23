declare enum EXCEPTION {
    BadRequestException = "BadRequestException",
    InternalFailureException = "InternalFailureException",
    LimitExceededException = "LimitExceededException",
    UnrecognizedClientException = "UnrecognizedClientException"
}
export declare class TranscribeException extends Error {
    static EXCEPTION: typeof EXCEPTION;
    static EXCEPTIONS_MAP: {
        BadRequestException: string;
        InternalFailureException: string;
        LimitExceededException: string;
        UnrecognizedClientException: string;
    };
    static isException(type: any): type is EXCEPTION;
    type: EXCEPTION | string;
    description: string;
    constructor(type: string, message: string);
}
export {};
