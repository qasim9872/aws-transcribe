export { AwsTranscribe } from "./AwsTranscribe"
export { StreamingClient } from "./StreamingClient"
export * from "./types"

// import { StreamingClient } from "./StreamingClient"
// import { AwsTranscribe } from "./AwsTranscribe"
// new AwsTranscribe({ accessKeyId: "hello", secretAccessKey: "world" })
//     .createStreamingClient({
//         region: "eu-west-1",
//         languageCode: "en-GB",
//         sampleRate: 8000,
//     })
//     .on(StreamingClient.EVENTS.OPEN, () => console.log(`connection opened`))
//     .on(StreamingClient.EVENTS.ERROR, console.error)
//     .on(StreamingClient.EVENTS.DATA, console.info)
//     .on(StreamingClient.EVENTS.CLOSE, (...args) => console.log(`connection closed`, args))
