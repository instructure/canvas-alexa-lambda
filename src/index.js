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

const Alexa = require("ask-sdk-core");

const ApiClient = require("./apiClient");

const LaunchRequestHandler = require("./handlers/launch");
const HelpRequestHandler = require("./handlers/help");
const CancelStopNoRequestHandler = require("./handlers/cancelStopNo");
const LogInRequestHandler = require("./handlers/logIn");
const NeedsPinLoginRequestHandler = require("./handlers/needsPinLogin");
const NeedsTokenRequestHandler = require("./handlers/needsToken");
const GetBlackboardRequestHandler = require("./handlers/easterEggs");
const GetMissingRequestHandler = require("./handlers/getMissing");
const GetAnnouncements = require("./handlers/getAnnouncements");
const GetCalendarEvents = require("./handlers/getCalendarEvents");
const GetSubmissions = require("./handlers/getSubmissions");
const StudentGetGrades = require("./handlers/studentGetGrades");
const ParentGetGrades = require("./handlers/parentGetGrades");
const ErrorRequestHandler = require("./handlers/error");
const GetStudentProfilesRequestHandler = require("./handlers/getStudentProfiles");
const GetCourseworkRequestHandler = require("./handlers/getCoursework");

const PIN_TOKEN = "PIN_REFRESH_ONLY_TOKEN";

const skillBuilder = Alexa.SkillBuilders.custom();
let skill;

exports.handler = function(request, context) {
  const token = (request.session && request.session.user && request.session.user.accessToken) || "";
  context.token = token;
  const needsPinLogin = token.startsWith(PIN_TOKEN);
  context.needsPinLogin = needsPinLogin;
  context.api = new ApiClient(token, !!request.session && request.session.development);

  if (!skill) {
    skill = skillBuilder
      .addRequestHandlers(
        LaunchRequestHandler,
        HelpRequestHandler,
        CancelStopNoRequestHandler,
        LogInRequestHandler,
        NeedsPinLoginRequestHandler,
        NeedsTokenRequestHandler,
        GetBlackboardRequestHandler,
        GetMissingRequestHandler,
        GetAnnouncements,
        GetCalendarEvents,
        GetSubmissions,
        StudentGetGrades,
        ParentGetGrades,
        GetCourseworkRequestHandler,
        GetStudentProfilesRequestHandler
      )
      .addErrorHandlers(ErrorRequestHandler)
      .create();
  }

  return skill.invoke(request, context);
};
