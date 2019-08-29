/*
 * Copyright 2018-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
const ErrorResponse = require("../utils/errorResponse");
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
              startDate: dueTime.start.slice(0, 10),
              endDate: dueTime.end.slice(0, 10)
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
        description: coursework.description, // This puts out HTML, which may not be parsable by Alexa
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
