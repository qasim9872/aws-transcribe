# AWS Transcribe

A client for Amazon Transcribe using the websocket interface

## Getting Started

With NPM install the module with: `npm install aws-transcribe --save`  
With YARN install the module with: `yarn add aws-transcribe`

## Example

An example of streaming from microphone can be found in src/examples/stream-from-microphone.ts

```typescript
import { AwsTranscribe, StreamingClient, TranscriptEvent } from "aws-transcribe"

const client = new AwsTranscribe({
    // if these aren't provided, they will be taken from the environment
    accessKeyId: "ACCESS KEY HERE",
    secretAccessKey: "SECRET KEY HERE",
})

const transcribeStream = client
    .createStreamingClient({
        region: "eu-west-1",
        sampleRate: 16000,
        languageCode: "en-US",
    })
    // enums for returning the event names which the stream will emit
    .on(StreamingClient.EVENTS.OPEN, () => console.log(`transcribe connection opened`))
    .on(StreamingClient.EVENTS.ERROR, console.error)
    .on(StreamingClient.EVENTS.CLOSE, () => console.log(`transcribe connection closed`))
    .on(StreamingClient.EVENTS.DATA, (data: TranscriptEvent) => {
        const results = data.Transcript.Results

        if (!results || results.length === 0) {
            return
        }

        const result = results[0]
        const final = !result.IsPartial
        const prefix = final ? "recognized" : "recognizing"
        const text = result.Alternatives[0].Transcript
        console.log(`${prefix} text: ${text}`)
    })

yourStream.pipe(transcribeStream)
```

## API

### new AwsTranscribe(clientConfig)

This creates a service wrapper which can then be used to create a streaming client

The `clientConfig` is optional and can be provided with the following properties:

-   `accessKeyId` if not provided, the package will look for `AWS_ACCESS_KEY_ID` environment variable
-   `secretAccessKey` if not provided, the package will look for `AWS_SECRET_ACCESS_KEY` environment variable

### AwsTranscribe.createStreamingClient(transcribeStreamConfig)

This will create a presigned url using the config and return an instance of StreamingClient which is a wrapper around the websocket. It will decode binary messages coming from AWS and encode messages to binary when sending them

The `transcribeStreamConfig` is required and must have the following properties:

-   `region` must be one of "us-east-1", "us-east-2", "us-west-2", "ap-southeast-2", "ca-central-1", "eu-west-1"
-   `languageCode` must be one of "en-US", "en-AU", "en-GB", "fr-CA", "fr-FR", "es-US"
-   `sampleRate` must be between 8000 and 44100 - the supported sample rate differs depending on the language code being used. For more information, go [here](https://docs.aws.amazon.com/transcribe/latest/dg/streaming.html)

### StreamingClient EVENTS

-   `open` - when the socket to aws is opened
-   `error` - any errors sent as part of websocket message or websocket error
-   `data` - emits the transcription object
-   `close` - when the socket to aws closes

## Debugging

set environment variable to below when running your application.

```cli
DEBUG=aws-transcribe:\*
```

## Issues

If you discover a bug, please raise an issue on Github. https://github.com/qasim9872/aws-transcribe/issues

## Contribution

Pull requests are very welcome. Please:

-   ensure all tests pass before submitting PR
-   add tests for new features
-   document new functionality/API additions in README.md

## License

Copyright (c) 2020 Muhammad Qasim. Licensed under the MIT license.
