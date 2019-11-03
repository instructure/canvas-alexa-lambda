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
const namespace = "Alexa.Education.Profile.Student";
const name = "Get";
const interfaceVersion = "1.0";

function formatUser(student, relationType) {
  const [family, given] = student.sortable_name.split(", ");
  return {
    id: student.id,
    accountRelationType: relationType,
    name: {
      full: student.name,
      nicknames: [student.short_name], // we could get rid of this, it's optional and right now this defaults to full name
      given: given || student.name.split(" ")[0],
      family
    }
  };
}

async function getProfile(api, paginationInfo) {
  if (paginationInfo.page > 1) {
    return [];
  }
  const profile = await api.getProfile();
  return [formatUser(profile.data, "SELF")];
}

async function getObservees(api, paginationInfo) {
  const { observees, nextToken } = await api.getObservees(paginationInfo);
  return { observees: observees.map(o => formatUser(o, "GUARDIAN")), nextToken };
}

const GetStudentProfilesRequestHandler = {
  canHandle(handlerInput) {
    return (
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
    const paginationInfo = {
      page:
        parseInt(handlerInput.requestEnvelope.request.payload.paginationContext.nextToken, 10) || 1,
      perPage:
        parseInt(handlerInput.requestEnvelope.request.payload.paginationContext.maxResults, 10) || 5
    };
    const fetchProfile = getProfile(handlerInput.context.api, paginationInfo);
    const fetchObservees = getObservees(handlerInput.context.api, paginationInfo);

    return Promise.all([fetchProfile, fetchObservees])
      .then(([profile, observeesResponse]) => {
        const { observees, nextToken } = observeesResponse;
        const studentProfiles = [...profile, ...observees];

        const response = {
          header: {
            namespace: "Alexa.Education.Profile.Student",
            name: "GetResponse",
            messageId: handlerInput.requestEnvelope.request.header.messageId,
            interfaceVersion: handlerInput.requestEnvelope.request.header.interfaceVersion
          },
          payload: {
            paginationContext: {},
            studentProfiles
          }
        };

        if (nextToken) {
          response.payload.paginationContext.nextToken = "" + nextToken;
        }

        return response;
      })
      .catch(err =>
        ErrorResponse("notAvailable", handlerInput.requestEnvelope.request.header.messageId)
      );
  }
};

module.exports = GetStudentProfilesRequestHandler;
