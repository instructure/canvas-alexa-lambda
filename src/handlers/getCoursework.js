/*
 * Copyright (C) 2019 - present Instructure, Inc.
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

const ErrorResponse = require("../utils/errorResponse");
const StripTags = require("striptags");
const namespace = "Alexa.Education.Coursework";
const name = "Get";
const interfaceVersion = "1.0";

const GetCourseworkRequestHandler = {
  canHandle(handlerInput) {
    return (
      !handlerInput.context.needsPinLogin &&
      handlerInput.context.token &&
      handlerInput.requestEnvelope.request.header &&
      handlerInput.requestEnvelope.request.header.namespace &&
      handlerInput.requestEnvelope.request.header.name &&
      handlerInput.requestEnvelope.request.header.interfaceVersion &&
      handlerInput.requestEnvelope.request.header.namespace === namespace &&
      handlerInput.requestEnvelope.request.header.name === name &&
      handlerInput.requestEnvelope.request.header.interfaceVersion === interfaceVersion
    );
  },

  handle(handlerInput) {
    const {
      studentId,
      courseId,
      courseworkType,
      dueTime
    } = handlerInput.requestEnvelope.request.payload.query.matchAll;

    return handlerInput.context.api
      .getActiveUserCourses(studentId)
      .then(coursesResult => {
        const matchingCourses = courseId
          ? coursesResult.data.filter(course => course.id == courseId)
          : coursesResult.data;

        if (!matchingCourses.length) {
          return this.formatOutput(handlerInput, [], [], null);
        }

        const contextCodes = matchingCourses
          // maybe FIXME: there's a weird course on siteadmin accounts where
          // the course id === the root account id and including it with calendar
          // API causes a 401, so this removes the course, sorta hacky
          .filter(course => course.id !== course.root_account_id)
          .map(course => `course_${course.id}`);

        const paginationInfo = {
          page:
            parseInt(
              handlerInput.requestEnvelope.request.payload.paginationContext.nextToken,
              10
            ) || 1,
          perPage:
            parseInt(
              handlerInput.requestEnvelope.request.payload.paginationContext.maxResults,
              10
            ) || 5
        };

        return handlerInput.context.api
          .getCalendarEvents(
            {
              userId: studentId,
              courseworkType,
              contextCodes,
              startDate: dueTime.start,
              endDate: dueTime.end
            },
            paginationInfo
          )
          .then(eventsResult => {
            const { events, nextToken } = eventsResult;
            return this.formatOutput(handlerInput, events, matchingCourses, nextToken);
          });
      })
      .catch(error =>
        ErrorResponse("notAvailable", handlerInput.requestEnvelope.request.header.messageId)
      );
  },

  formatOutput(handlerInput, data, courses, nextToken) {
    const formattedData = data.map(coursework => {
      const isQuiz = coursework.assignment.submission_types.includes("online_quiz");
      const course = courses.find(course => course.id === coursework.assignment.course_id);
      return {
        id: coursework.assignment.id,
        courseId: coursework.assignment.course_id,
        courseName: course && course.name,
        title: coursework.title,
        description: StripTags(coursework.description || ""),
        type: isQuiz ? "ASSESSMENT" : "ASSIGNMENT",
        dueTime: coursework.assignment.due_at
        // submissionState and publishedTime are optional on the PDF
      };
    });

    const result = {
      header: {
        namespace,
        name: "GetResponse",
        messageId: handlerInput.requestEnvelope.request.header.messageId,
        interfaceVersion
      },
      payload: {
        paginationContext: {},
        coursework: formattedData
      }
    };

    if (nextToken) {
      result.payload.paginationContext.nextToken = "" + nextToken;
    }

    return result;
  }
};

module.exports = GetCourseworkRequestHandler;
