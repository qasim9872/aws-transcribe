import { WebSocket } from "mock-socket"

export default class MockWebSocket extends WebSocket {
    constructor(url: string) {
        super(url)
    }

    /**
     * @description attaches the events as they are expected
     * @param event
     * @param handler
     */
    on(event: string, handler: any) {
        switch (event) {
            case "open":
                this.onopen = handler
                break
            case "error":
                this.onerror = handler
                break
            case "message":
                this.onmessage = handler
                break
            case "close":
                this.onclose = handler
                break
        }
    }
}
