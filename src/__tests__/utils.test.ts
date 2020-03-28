jest.mock("debug")

import { mocked } from "ts-jest/utils"
import debug from "debug"
import { AwsEventMessage } from "../types"
import { getAwsEventMessage, createDebugger } from "../utils"

const mockedDebug = mocked(debug, true)

describe("getAwsEventMessage(buffer)", () => {
    let buffer: Buffer
    let message: AwsEventMessage
    beforeEach(() => {
        buffer = Buffer.alloc(100).fill(0xff)
        message = getAwsEventMessage(buffer)
    })

    describe("Event Message", () => {
        it(`should have a header object`, () => {
            expect(message.headers).toBeDefined()
        })

        it(`header should have :message-type`, () => {
            const messageType = message.headers[":message-type"]
            expect(messageType).toBeDefined()
            expect(messageType.type).toBe("string")
            expect(messageType.value).toBe("event")
        })

        it(`header should have :event-type`, () => {
            const eventType = message.headers[":event-type"]
            expect(eventType).toBeDefined()
            expect(eventType.type).toBe("string")
            expect(eventType.value).toBe("AudioEvent")
        })

        it(`should set the buffer argument as the body`, () => {
            const body = message.body

            expect(body).toBeDefined()
            expect(body).toBe(buffer)
        })
    })
})

describe("createDebugger(filePath)", () => {
    it(`should extract the file name and create an instance of debug with it`, () => {
        const name = "name"
        const expectedName = `aws-transcribe:${name}`
        const filePath = `/development-workspace/personal/aws-transcribe/${name}.extension`
        createDebugger(filePath)

        expect(mockedDebug).toBeCalled()
        expect(mockedDebug).toBeCalledWith(expectedName)
    })

    it(`should use the given name and create an instance of debug with it`, () => {
        const name = "name"
        const expectedName = `aws-transcribe:${name}`
        createDebugger(name)

        expect(mockedDebug).toBeCalled()
        expect(mockedDebug).toBeCalledWith(expectedName)
    })
})
