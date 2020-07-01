/// <reference types="node" />
import { Writable } from "stream";
declare enum STREAM_EVENTS {
    OPEN = "open",
    DATA = "data",
    ERROR = "error",
    CLOSE = "close"
}
export declare class StreamingClient extends Writable {
    static EVENTS: typeof STREAM_EVENTS;
    private url;
    private ws;
    constructor(url: string);
    private _onopen;
    handleException(exception: Error, type?: string): void;
    private _onmessage;
    private _onerror;
    private _onclose;
    _write(chunk: any, _: string, cb: any): void;
    destroy(): void;
}
export {};
