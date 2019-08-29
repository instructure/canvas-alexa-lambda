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
        namespace: 'Alexa.Education.Coursework',
        name: 'Get',
        messageId: '<message id>',
        interfaceVersion: '1.0'
      },
      authorization: {
        type: 'BearerToken',
        token: '$host;$accessToken'
      },
      payload: {
        paginationContext: {
          maxResults: 5,
        },
        query: {
          matchAll: {
            studentId: '99',
            dueTime: {
              start: '2019-08-26T01:00:01Z',
              end: '2019-09-20T01:00:01Z'
            }
          }
        },
        locale: 'en-US'
      }
    },
  },
  {}
).then((result) => {
  console.log(result);
  console.log(result.response.payload.paginationContext);
  console.log(result.response.payload.coursework);
});"