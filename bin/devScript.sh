#!/bin/bash
set -eu
set -o pipefail

include () {
  [[ -f "$1" ]] && source "$1"
}

if [[ $# -eq 0 ]] || [[ "$1" = "--help" ]] || [[ "$1" = "-h" ]]; then
  echo 'Usage: ./devScript <intent string>'
  exit 0
fi

include ".lambda-dev" || {
  echo "You need to have a .lambda-dev file to continue"
  exit 1
}

echo "response for Intent: $*"
node -e "require('./src/index.js').handler(
  {
    request: {
      type: 'IntentRequest',
      intent: {
        name: '$*'
      },
      locale: 'en'
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
  },{succeed: require('./src/index.js').devSuccessHandler, fail: require('./src/index.js').devSuccessHandler}
)"
