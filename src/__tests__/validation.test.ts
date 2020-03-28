import { isString, isFalsy, validateIsStringOtherwiseThrow } from "../validation"

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

describe("isFalsy(v)", () => {
    it(`should return false if v is defined`, () => {
        const v = "hello world"

        expect(isFalsy(v)).toBeFalsy()
    })
    it(`should return false if v is undefined`, () => {
        const v = undefined

        expect(isFalsy(v)).toBeTruthy()
    })
})

describe("validateIsStringOtherwiseThrow(v, key)", () => {
    it(`should return true if v is defined and is string`, () => {
        const v = "hello world"
        const key = "test"

        expect(validateIsStringOtherwiseThrow(v, key)).toBeTruthy()
    })

    it(`should throw an error if v is undefined`, () => {
        const v = undefined
        const key = "key"
        const errorMessage = `${key} is not defined. it needs to be set in the environment or explicitly passed in the config`

        const wrapper = () => validateIsStringOtherwiseThrow(v, key)

        expect(wrapper).toThrowError(new Error(errorMessage))
    })

    it(`should throw an error if v is not a string`, () => {
        const v = {}
        const key = "key"
        const errorMessage = `${key} must be a string`

        const wrapper = () => validateIsStringOtherwiseThrow(v, key)

        expect(wrapper).toThrowError(new Error(errorMessage))
    })
})
