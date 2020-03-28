export function isFalsy(v: any) {
    return !v
}

export function isString(v: any): v is string {
    return typeof v === "string"
}

export function validateIsStringOtherwiseThrow(v: any, name: string): v is string {
    if (isFalsy(v)) {
        throw new Error(
            `${name} is not defined. it needs to be set in the environment or explicitly passed in the config`
        )
    } else if (!isString(v)) {
        throw new Error(`${name} must be a string`)
    }
    return true
}
