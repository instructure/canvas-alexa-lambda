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
const sinon = require("sinon");
const GetStudentProfilesRequestHandler = require("../getStudentProfiles");

describe("GetStudentProfiles", () => {
  let handlerInput;
  let mockApi;

  beforeEach(() => {
    mockApi = {};
    handlerInput = {
      context: {
        needsPinLogin: false,
        token: "some-token",
        api: mockApi
      },
      requestEnvelope: {
        request: {
          header: {
            namespace: "Alexa.Education.Profile.Student",
            name: "Get",
            interfaceVersion: "1.0",
            messageId: 123
          },
          payload: {
            paginationContext: {
              maxResults: 5
            },
            locale: "en-US"
          }
        }
      }
    };
  });

  const createError = (input, type, message) => {
    return {
      header: {
        namespace: "Alexa.Education",
        name: "ErrorResponse",
        messageId: input.requestEnvelope.request.header.messageId,
        interfaceVersion: "1.0"
      },
      payload: {
        type,
        message
      }
    };
  };

  const formatOutput = data => {
    return {
      header: {
        namespace: "Alexa.Education.Profile.Student",
        name: "GetResponse",
        messageId: 123,
        interfaceVersion: "1.0"
      },
      payload: {
        paginationContext: {
          nextToken: "2",
          totalCount: data.length
        },
        studentProfiles: data
      }
    };
  };

  const profile = {
    id: 1,
    name: "Student 1",
    sortable_name: "1, Student",
    short_name: "Short Student 1"
  };

  const observers = {
    observees: [
      { id: 2, name: "Observer 1", sortable_name: "1, Observer", short_name: "Short Observer 1" },
      { id: 3, name: "Observer 2", sortable_name: "2, Observer", short_name: "Short Observer 2" }
    ],
    nextToken: 2
  };

  const profileResult = {
    id: 1,
    accountRelationType: "SELF",
    name: {
      full: "Student 1",
      nicknames: ["Short Student 1"],
      given: "Student",
      family: "1"
    }
  };

  const observersResult = [
    {
      id: 2,
      accountRelationType: "GUARDIAN",
      name: {
        full: "Observer 1",
        nicknames: ["Short Observer 1"],
        given: "Observer",
        family: "1"
      }
    },
    {
      id: 3,
      accountRelationType: "GUARDIAN",
      name: {
        full: "Observer 2",
        nicknames: ["Short Observer 2"],
        given: "Observer",
        family: "2"
      }
    }
  ];

  stubGetProfileSuccess = data => {
    mockApi.getProfile = sinon.stub().resolves({ data });
  };

  stubGetProfileError = () => {
    mockApi.getProfile = sinon.stub().throws();
  };

  stubGetObserveesSuccess = data => {
    mockApi.getObservees = sinon.stub().resolves(data);
  };

  stubGetObserveesError = () => {
    mockApi.getObservees = sinon.stub().throws();
  };

  describe("canHandle", () => {
    it("returns false if needsPinLogin is true", () => {
      handlerInput.context.needsPinLogin = true;
      expect(GetStudentProfilesRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns false if token is empty", () => {
      handlerInput.context.token = null;
      expect(GetStudentProfilesRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns false if token is empty", () => {
      handlerInput.context.token = null;
      expect(GetStudentProfilesRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns false if header is empty", () => {
      handlerInput.requestEnvelope.request.header = null;
      expect(GetStudentProfilesRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns false if namespace is empty", () => {
      handlerInput.requestEnvelope.request.header.namespace = null;
      expect(GetStudentProfilesRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns false if name is empty", () => {
      handlerInput.requestEnvelope.request.header.name = null;
      expect(GetStudentProfilesRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns false if interfaceVersion is empty", () => {
      handlerInput.requestEnvelope.request.header.interfaceVersion = null;
      expect(GetStudentProfilesRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns false if namespace is not Alexa.Education.Profile.Student", () => {
      handlerInput.requestEnvelope.request.header.namespace = "Alexa.Education.SomethingElse";
      expect(GetStudentProfilesRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns false if name is not Get", () => {
      handlerInput.requestEnvelope.request.header.name = "Post";
      expect(GetStudentProfilesRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns false if interfaceVersion is not 1.0", () => {
      handlerInput.requestEnvelope.request.header.interfaceVersion = "2.0";
      expect(GetStudentProfilesRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns true if needsPinLogin is false, token is present, and data matches", () => {
      expect(GetStudentProfilesRequestHandler.canHandle(handlerInput)).toBeTruthy();
    });
  });

  describe("handle", () => {
    it("returns error response if getProfile and getObservees fail", async () => {
      stubGetProfileError();
      stubGetObserveesError();
      const result = await GetStudentProfilesRequestHandler.handle(handlerInput);
      const expected = createError(
        handlerInput,
        "CONTENT_NOT_AVAILABLE",
        "Access to this content is not available."
      );
      expect(result).toEqual(expected);
    });

    it("returns error response if getProfile fails", async () => {
      stubGetProfileError();
      stubGetObserveesSuccess(observers);
      const result = await GetStudentProfilesRequestHandler.handle(handlerInput);
      const expected = createError(
        handlerInput,
        "CONTENT_NOT_AVAILABLE",
        "Access to this content is not available."
      );
      expect(result).toEqual(expected);
    });

    it("returns error response if getObservees fails", async () => {
      stubGetProfileSuccess(profile);
      stubGetObserveesError();
      const result = await GetStudentProfilesRequestHandler.handle(handlerInput);
      const expected = createError(
        handlerInput,
        "CONTENT_NOT_AVAILABLE",
        "Access to this content is not available."
      );
      expect(result).toEqual(expected);
    });

    it("returns profile and observees if getProfile and getObservees succeed", async () => {
      stubGetProfileSuccess(profile);
      stubGetObserveesSuccess(observers);
      const result = await GetStudentProfilesRequestHandler.handle(handlerInput);
      expect(result).toEqual(formatOutput([profileResult, ...observersResult]));
    });
  });
});
