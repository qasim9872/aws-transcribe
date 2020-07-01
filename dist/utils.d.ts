/// <reference types="node" />
import debug from "debug";
export declare function createDebugger(filePath: string): debug.Debugger;
export declare function getAwsEventMessage(buffer: Buffer): {
    headers: {
        ":message-type": {
            type: string;
            value: string;
        };
        ":event-type": {
            type: string;
            value: string;
        };
    };
    body: Buffer;
};
