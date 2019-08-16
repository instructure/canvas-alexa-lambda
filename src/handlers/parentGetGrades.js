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
const parseCourseSlot = require("../utils/parseCourseSlot");
const parseNameSlot = require("../utils/parseNameSlot");
const SanitizeMessage = require("../utils/sanitizeMessage");
const HELP_MESSAGE = "You can ask to list grades, or check if you have any missing assignments.";

module.exports = {
  canHandle(handlerInput) {
    return (
      !handlerInput.context.needsPinLogin &&
      handlerInput.context.token &&
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "ParentGetGrades"
    );
  },
  handle(handlerInput) {
    const nameSlot = handlerInput.requestEnvelope.request.intent.slots.Name.value;
    const courseSlot = handlerInput.requestEnvelope.request.intent.slots.Course.value;

    return handlerInput.context.api
      .getObservees()
      .then(observeesResult => {
        const matchedStudents = parseNameSlot(observeesResult.data, nameSlot);
        return Promise.all(
          matchedStudents.map(student => {
            return handlerInput.context.api
              .getActiveUserCourses(student.id, ["total_scores"])
              .then(coursesResult => {
                return {
                  student: student.short_name,
                  courses: parseCourseSlot(coursesResult.data, courseSlot)
                };
              });
          })
        ).then(result => {
          const speechResponse = result.length
            ? "Here are your students grades: " + formatStudentGrades(result, courseSlot)
            : `No ${nameSlot ? "matching " : ""}students found`;

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

function formatStudentGrades(studentCourses, courseSlot) {
  return studentCourses
    .map(({ student, courses }) => `For ${student}: ${formatCourses(courses, courseSlot)}`)
    .join("\n");
}

function formatCourses(courses, courseSlot) {
  if (courses.length) {
    return courses.map(course => formatCourse(course)).join("\n");
  } else {
    return `No ${courseSlot ? "matching " : ""}course found`;
  }
}

function formatCourse(course) {
  const enrollment = course.enrollments[0] || {};
  const grade = enrollment.computed_current_grade || enrollment.computed_current_score;
  const response = grade
    ? `In ${course.name}: the grade is ${grade}.`
    : `No grade posted for ${course.name}.`;
  return response;
}
