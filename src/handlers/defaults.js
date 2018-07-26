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
const HELP_MESSAGE = "You can ask to list grades, or check if you have any missing assignments.";

module.exports = {
  baseIntents: {
    "AMAZON.CancelIntent": function() {
      this.emit(":tell", "Goodbye!");
    },
    "AMAZON.StopIntent": function() {
      this.emit(":tell", "Goodbye!");
    },
    "AMAZON.NoIntent": function() {
      this.emit(":tell", "Goodbye!");
    },
    TellAndContinue: function(text) {
      this.emit(":ask", `${text}. Anything else?`, HELP_MESSAGE);
    }
  },
  launchIntents: {
    LaunchRequest: function() {
      this.emit("AMAZON.HelpIntent");
    },
    /* istanbul ignore next line */
    Unhandled: function() {
      /* istanbul ignore next line */
      this.emit(":tell", "Goodbye!");
    },
    "AMAZON.HelpIntent": function() {
      this.emit(":ask", HELP_MESSAGE, "What can I help you with?");
    }
  }
};
