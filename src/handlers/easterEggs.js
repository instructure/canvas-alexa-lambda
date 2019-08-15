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

module.exports = {
  GetBlackboard: function() {
    if (!this.event.session.user.accessToken) {
      this.emit(":tellWithLinkAccountCard", "You need to login with Canvas to use this skill.");
      return;
    }
    const responseIndex = Math.floor(Math.random() * crazyPhrases.length);
    // eslint-disable-next-line security/detect-object-injection
    const speechOutput = crazyPhrases[responseIndex];
    this.emit("TellAndContinue", speechOutput);
  }
};
