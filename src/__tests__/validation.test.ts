import { isString } from "../validation"

describe("isString(v)", () => {
    it(`should return true if v is string`, () => {
        const v = "hello world"

        expect(isString(v)).toBeTruthy()
    })
    it(`should return false if v is object`, () => {
        const v = ["hello", "world"]

        expect(isString(v)).toBeFalsy()
    })
})
