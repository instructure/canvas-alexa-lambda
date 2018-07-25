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
const { baseIntents, launchIntents } = require("./defaults");
const getMissing = require("./getMissing");
const studentGetGrades = require("./studentGetGrades");
const parentGetGrades = require("./parentGetGrades");
const getCalendarEvents = require("./getCalendarEvents");
const easterEggs = require("./easterEggs");
const getSubmissions = require("./getSubmissions");
const getAnnouncements = require("./getAnnouncements");
const initLogin = require("./logIn");

module.exports = function initHandlers(token, needsPinLogin) {
  const logIn = initLogin(token);
  let handlers = Object.assign(
    {},
    launchIntents,
    getMissing,
    studentGetGrades,
    parentGetGrades,
    getCalendarEvents,
    easterEggs,
    getSubmissions,
    getAnnouncements
  );

  // if we need to do a pin login..
  if (needsPinLogin) {
    const loginHandlers = {};

    // replace all the normal handlers with a "you need to login" handler
    Object.keys(handlers).forEach(key => {
      loginHandlers[key] = logIn.needsLogin;
    });

    // add the logIn handler last so it's still available
    Object.assign(loginHandlers, logIn.intent);

    // return a modified version of the regular handlers
    handlers = loginHandlers;
  }

  // add baseIntents last so they're always available
  Object.assign(handlers, baseIntents);

  return handlers;
};
