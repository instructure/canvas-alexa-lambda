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
        namespace: 'Alexa.Education.School.Communication',
        name: 'Get',
        messageId: '91293',
        interfaceVersion: '1.0'
      },
      authorization: {
        type: 'BearerToken',
        token: '$host;$accessToken'
      },
      payload: {
        paginationContext: {
          maxResults: 1,
        },
        query: {
          matchAll: {
            studentId: 829,
            courseId: 5
          }
        },
        locale: 'en-US'
      }
    },
    development: true
  },
  {}
).then((result) => {
  console.log(result);
  console.log(result.response.payload.paginationContext);
  result.response.payload.schoolCommunications.forEach(c => console.log(c));
});"