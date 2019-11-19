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
const HelpRequestHandler = require("./help");
const skillName = "Canvas";

module.exports = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  handle(handlerInput) {
    //Users will need to link their account to access their information.

    //check if access token is present in the Context object. Access the request in the handlerInput object

    var accessToken = handlerInput.requestEnvelope.context.System.user.accessToken;
    if (accessToken == undefined) {
      // the request did not include an access token, tell the user to link accounts and return a LinkAccount card

      const LinkAccountWelcomeMessage =
        "The Canvas skill now works with Alexa. To get started, you must link your account, then ask, 'Alexa, what's my homework or 'Alexa, do I have any updates from school?'";

      return handlerInput.responseBuilder
        .speak(LinkAccountWelcomeMessage)
        .withLinkAccountCard()
        .withShouldEndSession(true)
        .getResponse();
    } else {
      const welcomeMessage =
        "The Canvas skill now works with Alexa. To get started, you must link your account, then ask, 'Alexa, what's my homework or 'Alexa, do I have any updates from school?'";
      return handlerInput.responseBuilder
        .speak(welcomeMessage)
        .withSimpleCard(skillName, welcomeMessage)
        .withShouldEndSession(true)
        .getResponse();
    }
  }
};
