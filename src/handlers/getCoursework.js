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

        if (!matchingCourses) {
          return {};
        }

        const contextCodes = matchingCourses
          // maybe FIXME: there's a weird course on siteadmin accounts where
          // the course id === the root account id and including it with calendar
          // API causes a 401, so this removes the course, sorta hacky
          .filter(course => course.id !== course.root_account_id)
          .map(course => `course_${course.id}`);

        return handlerInput.context.api
          .getCalendarEvents({
            userId: studentId,
            courseworkType,
            contextCodes,
            startDate: dueTime.start.slice(0, 10),
            endDate: dueTime.end.slice(0, 10)
          })
          .then(eventsResult => {
            return this.formatOutput(handlerInput, eventsResult.data, matchingCourses);
          })
          .catch(error => {
            return {};
          });
      })
      .catch(error => {
        return {};
      });
  },

  formatOutput(handlerInput, data, courses) {
    const formattedData = data.map(coursework => {
      return {
        id: coursework.assignment.id,
        courseId: coursework.assignment.course_id,
        courseName: courses.find(course => course.id === coursework.assignment.course_id).name,
        title: coursework.title,
        description: coursework.description, // This puts out HTML, which may not be parsable by Alexa
        type: coursework.assignment.is_quiz_assignment ? "ASSESSMENT" : "ASSIGNMENT", // This assumes that is_quiz_assignment? works for old Quizzes and Quizzes Next
        dueTime: coursework.assignment.due_at
        // submissionState and publishedTime are optional on the PDF
      };
    });

    return {
      header: {
        namespace,
        name: "GetResponse",
        messageId: handlerInput.requestEnvelope.request.header.messageId,
        interfaceVersion
      },
      payload: {
        paginationContext: {
          totalCount: data.length
        },
        coursework: formattedData
      }
    };
  }
};

module.exports = GetCourseworkRequestHandler;
