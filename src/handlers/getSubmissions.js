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

module.exports = {
  canHandle(handlerInput) {
    return (
      !handlerInput.context.needsPinLogin &&
      handlerInput.context.token &&
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "GetUngradedSubmissions"
    );
  },
  handle(handlerInput) {
    return handlerInput.context.api
      .getActiveTeacherCourses()
      .then(coursesResult => {
        if (!coursesResult.data.length) {
          return handlerInput.responseBuilder
            .speak("You have no courses to grade. Anything else?")
            .reprompt(HELP_MESSAGE)
            .getResponse();
        }

        return Promise.all(
          coursesResult.data.map(course => {
            return handlerInput.context.api
              .getStudentSubmissions(course.id)
              .then(submissionsResult => {
                return { course, subs: submissionsResult.data };
              });
          })
        ).then(submissionsResult => {
          let speechResponse = "";
          submissionsResult.forEach((submissionResponse, index) => {
            speechResponse += `${submissionResponse.course.name}, `;
            let ungradedCount = 0;
            submissionResponse.subs.forEach((sub, index) => {
              if (sub.workflow_state === "submitted" && !sub.grade) {
                ungradedCount++;
              }
            });
            speechResponse += `${ungradedCount}. `;
          });

          return handlerInput.responseBuilder
            .speak(`${SanitizeMessage(speechResponse)}. Anything else?`)
            .reprompt(HELP_MESSAGE)
            .getResponse();
        });
      })
      .catch(error => {
        return handlerInput.responseBuilder
          .speak("There was a problem communicating with Canvas. Please try again later.")
          .withShouldEndSession(true)
          .getResponse();
      });
  }
};
