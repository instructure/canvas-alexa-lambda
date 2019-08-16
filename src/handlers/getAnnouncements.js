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
      handlerInput.requestEnvelope.request.intent.name === "GetAnnouncements"
    );
  },
  handle(handlerInput) {
    // grab active student enrollments
    return handlerInput.context.api
      .getActiveCourses()
      .then(coursesResult => {
        if (coursesResult.data.length === 0) {
          return handlerInput.responseBuilder
            .speak("You have no active courses. Anything else?")
            .reprompt(HELP_MESSAGE)
            .getResponse();
        }

        const courses = coursesResult.data.map(course => ({
          course_code: `course_${course.id}`,
          course
        }));

        return handlerInput.context.api
          .getAnnouncements({ contextCodes: courses.map(c => c.course_code) })
          .then(announcementsResult => {
            if (announcementsResult.data.length === 0) {
              return handlerInput.responseBuilder
                .speak("You have no announcements. Anything else?")
                .reprompt(HELP_MESSAGE)
                .getResponse();
            }

            const result = courses.reduce((obj, item) => {
              obj[item.course_code] = item.course;
              return obj;
            }, {});

            const annSpeech = announcementsResult.data
              .map(ann => `In course ${result[ann.context_code].name}: ${ann.title}`)
              .join(",\n");

            const speechOutput = `Here are your announcements: ${annSpeech}. Anything else?`;
            return handlerInput.responseBuilder
              .speak(SanitizeMessage(speechOutput))
              .reprompt(HELP_MESSAGE)
              .getResponse();
          })
          .catch(error => {
            return handlerInput.responseBuilder
              .speak("There was a problem communicating with Canvas. Please try again later.")
              .withShouldEndSession(true)
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
