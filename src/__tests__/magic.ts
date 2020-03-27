import { magic } from "../index"

describe("magic()", () => {
    it(`should return an array created by splitting the argument`, () => {
        const text = "hello"

        const textArray = magic(text)

        expect(textArray).toBeDefined()
        expect(textArray.length).not.toBe(0)
        expect(textArray.length).toBe(text.length)
        expect(textArray).toEqual(text.split(""))
    })
})
