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
