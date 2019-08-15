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

const Alexa = require("ask-sdk-v1adapter");

const initHandlers = require("./handlers");
const ApiClient = require("./apiClient");
const SanitizeMessage = require("./utils/sanitizeMessage");

const PIN_TOKEN = "PIN_REFRESH_ONLY_TOKEN";

exports.handler = function(event, context) {
  const alexa = Alexa.handler(event, context);
  alexa.appId = process.env.ALEXA_APP_ID || "1";
  if (event.session.development) {
    alexa.development = true;
  }

  const token = event.session.user.accessToken || "";
  const needsPinLogin = token.startsWith(PIN_TOKEN);
  context.sanitizeMessage = SanitizeMessage;

  alexa.registerHandlers(initHandlers(token, needsPinLogin));
  if (!needsPinLogin) {
    context.api = new ApiClient(alexa, token);
  }

  alexa.execute();
};
/* istanbul ignore next line */
exports.devSuccessHandler = function(response) {
  console.log(response);
};
