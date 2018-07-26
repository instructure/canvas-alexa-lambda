# Canvas Alexa Lambda

[Canvas](https://github.com/instructure/canvas-lms) Alexa Lambda is the lambda function that runs all intents present in the Canvas-LMS Alexa Skill.

## Getting Started

To get started you will need to set up your `.lambda-dev` file. The `.lambda-dev-example` files has a basic setup, however you will still need to get your own
access key for the host you are running against.  For the best local development experience (and easiest to track requests/problems) it is recommeneded to clone
and run [Canvas-lms](https://github.com/instructure/canvas-lms) locally.  If you do that you should be able to keep the default host in the `.lambda-dev-example`.
From there you will you should be able to visit your users settings (`<host>profile/settings`) to create an access token and paste it into the `.lambda-dev` file.

After that you should be able to run the `devScript.sh` with the intent you would like to test:

*Docker*

`docker build -t alexaLambda`
`docker run -it --rm alexaLambda ./bin/devScript.sh <intentName>`

*local*

`yarn`
`./bin/devScript.sh <intentName>`

The script will run the lambda with some dummy session and context data and return to you
the output of your intent in the saml field.

example:

```
$ ./bin/devScript.sh GetBlackboard
response for Intent: GetBlackboard
{ version: '1.0',
  response:
   { shouldEndSession: false,
     outputSpeech:
      { type: 'SSML',
        ssml: '<speak> You must be crazy. Anything else? </speak>' },
     reprompt: { outputSpeech: [Object] } },
  sessionAttributes: 'mock session attributes' }
```

### Prerequisites

You will either need:

[Docker](https://www.docker.com/)

or

[Node](https://nodejs.org/en/) v8.10.0
You can use npm if you would like, however we use [Yarn](https://yarnpkg.com/lang/en/) for this project.

## Running the tests

We use jest for testing the canvas alexa lambda

*Docker*

`docker run alexaLambda yarn test`

*local*

`yarn test`

### And coding style tests

We use prettier in this project.  Once you are comfortable with your intent or change you can run:

`yarn prettier --write "**/*.js"`

This will auto format your code to our prettier standard.

## Deployment

See Running On an actual Alexa device for more help here!

## Built With

* [Alexa-AWS-SDK](https://github.com/alexa/alexa-skills-kit-sdk-for-nodejs) - The library to handle intents
* [Node](https://nodejs.org/en/) - javascript engine

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

## Authors

* **Steven Burnett** - *Initial work* - [sdb1228](https://github.com/sdb1228)
* **Landon Gilbert-Bland** - *Initial work* - [vimalloc](https://github.com/vimalloc)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the GNU AFFERO GENERAL PUBLIC License - see the [LICENSE](LICENSE) file for details
