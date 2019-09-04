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
const namespace = "Alexa.Education.School.Communication";
const name = "Get";
const interfaceVersion = "1.0";

const formatResponse = (handlerInput, data, nextToken) => {
  const schoolCommunications = data.map(announcement => ({
    id: announcement.id,
    type: "GENERIC_FROM",
    from: announcement.user_name,
    kind: "ANNOUNCEMENT",
    content: {
      type: "PLAIN_TEXT",
      text: announcement.message || ""
    },
    publishedTime: announcement.posted_at || announcement.delayed_post_at
  }));

  const response = {
    header: {
      namespace: "Alexa.Education.School.Communication",
      name: "GetResponse",
      messageId: handlerInput.requestEnvelope.request.header.messageId,
      interfaceVersion: handlerInput.requestEnvelope.request.header.interfaceVersion
    },
    payload: {
      paginationContext: {},
      schoolCommunications
    }
  };

  if (nextToken) {
    response.payload.paginationContext.nextToken = "" + nextToken;
  }

  return response;
};

const GetSchoolCommunicationRequestHandler = {
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
    const { studentId, courseId } = handlerInput.requestEnvelope.request.payload.query.matchAll;

    const api = handlerInput.context.api;
    const query = studentId ? api.getActiveUserCourses(studentId) : api.getActiveCourses();

    return query
      .then(coursesResult => {
        const matchingCourses = courseId
          ? coursesResult.data.filter(course => course.id == courseId)
          : coursesResult.data;

        if (!matchingCourses.length) {
          return formatResponse(handlerInput, [], null);
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
          .getAnnouncements({ contextCodes }, paginationInfo)
          .then(announcementsResult => {
            const { announcements, nextToken } = announcementsResult;
            return formatResponse(handlerInput, announcements, nextToken);
          });
      })
      .catch(error => {
        return ErrorResponse("notAvailable", handlerInput.requestEnvelope.request.header.messageId);
      });
  }
};

module.exports = GetSchoolCommunicationRequestHandler;
