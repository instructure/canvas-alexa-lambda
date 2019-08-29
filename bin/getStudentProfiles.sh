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
        messageId: '987654321',
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
        locale: 'en-US'
      }
    },
  },
  {}
).then((result) => {
  console.log(result);
  console.log(result.response.payload.paginationContext);
  console.log(result.response.payload.studentProfiles);
  (result.response.payload.studentProfiles || []).forEach(s => console.log(s.name.nicknames));
});"
