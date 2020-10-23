import { EventStreamMarshaller } from "@aws-sdk/eventstream-marshaller";
export declare const eventStreamMarshaller: EventStreamMarshaller;
export declare function fromBinary(message: any): {
    wrapper: import("@aws-sdk/eventstream-marshaller").Message;
    body: any;
};
export declare function toBinary(chunk: any): Uint8Array;
