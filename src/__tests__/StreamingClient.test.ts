jest.mock("ws")

import WsServer from "jest-websocket-mock"
import { StreamingClient } from "../index"

function waitForEvent(event: string, streamClient: StreamingClient): Promise<any> {
    return new Promise((resolve) => {
        streamClient.on(event, resolve)
    })
}

describe("StreamingClient", () => {
    const url = `ws://localhost:12000`
    let server: WsServer

    beforeEach(async () => {
        server = new WsServer(url)
    })

    afterEach(() => {
        // clean up
        WsServer.clean()
    })

    describe("new StreamingClient()", () => {
        let client: StreamingClient
        beforeEach(() => {
            client = new StreamingClient(url)
        })

        it(`should connect to the server and emit the open event`, async () => {
            await waitForEvent(StreamingClient.EVENTS.OPEN, client)
        })

        describe("Opened connection", () => {
            beforeEach(async () => {
                // ensures the connection is open before we run any more tests
                await waitForEvent(StreamingClient.EVENTS.OPEN, client)
            })

            it(`should emit close event with code and reason when the socket connection closes`, () => {
                const closeCode = 1000
                const closeReason = `testing close event`
                expect.assertions(4)
                waitForEvent(StreamingClient.EVENTS.CLOSE, client).then((event) => {
                    const { code, reason } = event
                    expect(code).toBeDefined()
                    expect(code).toBe(closeCode)
                    expect(reason).toBeDefined()
                    expect(reason).toBe(closeReason)
                })
                server.close({
                    code: closeCode,
                    reason: closeReason,
                    wasClean: true,
                })
            })

            it(`should emit error event with the error if socket emits an error`, () => {
                expect.assertions(1)
                waitForEvent(StreamingClient.EVENTS.ERROR, client).then((error) => {
                    expect(error.type).toBe("error")
                })
                server.error()
            })
        })
    })
})
