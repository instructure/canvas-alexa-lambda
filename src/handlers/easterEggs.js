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
const crazyPhrases = [
  "You must be crazy",
  "You need help",
  "Seek help",
  "I do not think you are in a right state of mind",
  "You are not using this right"
];

const HELP_MESSAGE = "You can ask to list grades, or check if you have any missing assignments.";

const GetBlackboardRequestHandler = {
  canHandle(handlerInput) {
    return (
      !handlerInput.context.needsPinLogin &&
      handlerInput.context.token &&
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "GetBlackboard"
    );
  },
  handle(handlerInput) {
    const responseIndex = Math.floor(Math.random() * crazyPhrases.length);
    // eslint-disable-next-line security/detect-object-injection
    const speechOutput = crazyPhrases[responseIndex];
    return handlerInput.responseBuilder
      .speak(`${speechOutput}. Anything else?`)
      .reprompt(HELP_MESSAGE)
      .withShouldEndSession(false)
      .getResponse();
  }
};

module.exports = GetBlackboardRequestHandler;
