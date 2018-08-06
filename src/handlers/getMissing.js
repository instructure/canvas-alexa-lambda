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

module.exports = {
  GetMissing: function() {
    this.context.api.getMissingAssignments().then(res => {
      let speechResponse = null;
      if (res.data.length > 0) {
        speechResponse = "Yes, ";
        const loopCount = Math.min(2, res.data.length);
        for (let i = 0; i < loopCount; i++) {
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
      this.emit("TellAndContinue", this.context.sanitizeMessage(speechResponse));
    });
  }
};
