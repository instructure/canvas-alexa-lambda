/*
 * Copyright (C) 2018 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that they will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */
const axios = require("axios");
const queryString = require("querystring");
const AUTH_HOSTNAME = process.env.AUTH_HOSTNAME;

module.exports = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "LogIn"
    );
  },
  handle(handlerInput) {
    const pin = handlerInput.requestEnvelope.request.intent.slots.Pin.value;
    if (!pin) {
      return handlerInput.responseBuilder
        .speak(
          "Please provide a pin. To reset your pin, re-link your Canvas account with this skill."
        )
        .withShouldEndSession(true)
        .getResponse();
    }

    return axios
      .post(
        `https://${AUTH_HOSTNAME}/pin-auth`,
        queryString.stringify({ token: handlerInput.requestEnvelope.context.token, pin })
      )
      .then(result => {
        return handlerInput.responseBuilder
          .speak("Pin login successful. The Canvas skill is unlocked for ten minutes.")
          .withShouldEndSession(true)
          .getResponse();
      })
      .catch(err => {
        return handlerInput.responseBuilder
          .speak(
            "Pin login failed. Please try again. To reset your pin, re-link your Canvas account with this skill."
          )
          .withShouldEndSession(true)
          .getResponse();
      });
  }
};
