#!/bin/bash
set -eu
set -o pipefail

include () {
  [[ -f "$1" ]] && source "$1"
}

include ".lambda-dev" || {
  echo "You need to have a .lambda-dev file to continue"
  exit 1
}

echo "response for Intent: $*"
node -e "require('./src/index.js').handler(
  {
    request: {
      header: {
        namespace: 'Alexa.Education.Profile.Student',
        name: 'Get',
        messageId: 'some message ID',
        interfaceVersion: '1.0'
      },
      authorization: {
        type: 'BearerToken',
        token: '<a bearer token>'
      },
      payload: {
        paginationContext: {
          maxResults: 5,
        },
        locale: 'en-US'
      }
    },
    context: {
      System: {
        device: {
          deviceId: 'string',
          supportedInterfaces: {}
        },
        application: {
          applicationId: '1'
        },
        user: {
          accessToken: 'Atza|AAAAAAAA...',
        },
        apiEndpoint: 'https://api.amazonalexa.com',
        apiAccessToken: 'AxThk...'
      },
    },
    session: {
      development: true,
      application: {
        applicationId: '1'
      },
      attributes: 'mock session attributes',
      user:{
        accessToken: '$host;$accessToken'
      }
    }
  },
  {}
).then((result) => { console.log(result); console.log(result.response.payload.paginationContext); console.log(result.response.payload.studentProfiles); result.response.payload.studentProfiles.forEach(s => console.log(s.name.nicknames)); });"
