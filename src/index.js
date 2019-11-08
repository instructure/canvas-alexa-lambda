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

"use strict";

const skillName = "Canvas";
const welcomeMessage =
  skillName +
  " now works with Alexa! You can ask: 'Alexa, what homework do I have?' or, 'do I have any announcements from the school?'";
const fallbackMessage =
  "You can ask: 'Alexa, what homework do I have?' or, 'do I have any announcements from the school?'";

const Alexa = require("ask-sdk-core");

const ApiClient = require("./apiClient");

const LaunchRequestHandler = require("./handlers/launch");
const HelpRequestHandler = require("./handlers/help");
const CancelStopNoRequestHandler = require("./handlers/cancelStopNo");
const NeedsTokenRequestHandler = require("./handlers/needsToken");
const ErrorRequestHandler = require("./handlers/error");
const GetStudentProfilesRequestHandler = require("./handlers/getStudentProfiles");
const GetCourseworkRequestHandler = require("./handlers/getCoursework");
const GetSchoolCommunicationRequestHandler = require("./handlers/getSchoolCommunication");

const skillBuilder = Alexa.SkillBuilders.custom();
let skill;

const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.FallbackIntent"
    );
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(fallbackMessage)
      .withShouldEndSession(true)
      .getResponse();
  }
};

exports.handler = function(request, context) {
  let token = null;
  if (request.session) {
    token = (request.session && request.session.user && request.session.user.accessToken) || "";
  } else {
    token =
      (request &&
        request.request &&
        request.request.header &&
        request.request.authorization &&
        request.request.authorization.token) ||
      "";
  }

  let development;
  if (request.session) {
    development = !!request.session && request.session.development;
  } else {
    development = request.development;
  }

  context.token = token;
  context.api = new ApiClient(token, development);

  if (!skill) {
    skill = skillBuilder
      .addRequestHandlers(
        LaunchRequestHandler,
        HelpRequestHandler,
        CancelStopNoRequestHandler,
        FallbackIntentHandler,
        NeedsTokenRequestHandler,
        GetCourseworkRequestHandler,
        GetStudentProfilesRequestHandler,
        GetSchoolCommunicationRequestHandler
      )
      .addErrorHandlers(ErrorRequestHandler)
      .create();
  }

  return skill.invoke(request, context);
};
