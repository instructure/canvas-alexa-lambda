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

const SanitizeMessage = require("../utils/sanitizeMessage");
const HELP_MESSAGE = "You can ask to list grades, or check if you have any missing assignments.";

const GetMissingRequestHandler = {
  canHandle(handlerInput) {
    return (
      !handlerInput.context.needsPinLogin &&
      handlerInput.context.token &&
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "GetMissing"
    );
  },
  handle(handlerInput) {
    return handlerInput.context.api
      .getMissingAssignments()
      .then(res => {
        let speechResponse = null;
        if (res.data.length > 0) {
          speechResponse = "Yes, ";
          const loopCount = Math.min(2, res.data.length);
          for (let i = 0; i < loopCount; i++) {
            // eslint-disable-next-line security/detect-object-injection
            speechResponse += `Your assignment named ${res.data[i].name} is missing, `;
            if (i + 1 < loopCount) {
              speechResponse += "Also ";
            }
          }
          if (loopCount < res.data.length) {
            speechResponse += ` and ${res.data.length - loopCount} more.`;
          }
        } else {
          speechResponse = "You have no missing assignments";
        }
        speechResponse = `${speechResponse}. Anything else?`;

        return handlerInput.responseBuilder
          .speak(SanitizeMessage(speechResponse))
          .reprompt(HELP_MESSAGE)
          .withShouldEndSession(false)
          .getResponse();
      })
      .catch(error => {
        return handlerInput.responseBuilder
          .speak("There was a problem communicating with Canvas. Please try again later.")
          .withShouldEndSession(true)
          .getResponse();
      });
  }
};

module.exports = GetMissingRequestHandler;
