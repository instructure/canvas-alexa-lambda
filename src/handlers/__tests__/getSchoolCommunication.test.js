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
const constantDate = new Date("2017-06-13T04:41:20");
const GetSchoolCommunicationRequestHandler = require("../getSchoolCommunication");

Date = class extends Date {
  constructor() {
    return constantDate;
  }
};

describe("GetSchoolCommunication", () => {
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
            namespace: "Alexa.Education.School.Communication",
            name: "Get",
            interfaceVersion: "1.0",
            messageId: 123
          },
          payload: {
            paginationContext: {
              page: 2,
              perPage: 50
            },
            query: {
              matchAll: {}
            }
          }
        }
      }
    };
  });

  stubGetActiveCourses = data => {
    mockApi.getActiveCourses = sinon
      .stub()
      .withArgs(1)
      .resolves({ data });
  };

  stubGetActiveUserCourses = data => {
    mockApi.getActiveUserCourses = sinon
      .stub()
      .withArgs(1)
      .resolves({ data });
  };

  stubGetAnnouncements = data => {
    mockApi.getAnnouncements = sinon.stub().resolves(data);
  };

  formatOutput = data => {
    return {
      header: {
        namespace: "Alexa.Education.School.Communication",
        name: "GetResponse",
        messageId: 123,
        interfaceVersion: "1.0"
      },
      payload: {
        paginationContext: {
          nextToken: "2"
        },
        schoolCommunications: data
      }
    };
  };

  emptyOutput = () => {
    return {
      header: {
        namespace: "Alexa.Education.School.Communication",
        name: "GetResponse",
        messageId: 123,
        interfaceVersion: "1.0"
      },
      payload: {
        paginationContext: {},
        schoolCommunications: []
      }
    };
  };

  const coursesData = [{ id: 1, name: "Course 1" }, { id: 2, name: "Course 2" }];
  const announcementsData = [
    {
      id: 1,
      user_name: "Some Administrator",
      message: "<p>Some message here</p>",
      posted_at: "2019-11-05T00:00:000Z",
      delayed_post_at: null
    },
    {
      id: 2,
      user_name: "Some Other Administrator",
      message: "<p>Some <strong>other</strong> message here</p>",
      posted_at: null,
      delayed_post_at: "2019-11-11T00:00:000Z"
    }
  ];
  const announcementsResult = [
    {
      id: 1,
      type: "GENERIC_FROM",
      from: "Some Administrator",
      kind: "ANNOUNCEMENT",
      content: {
        type: "PLAIN_TEXT",
        text: "Some message here"
      },
      publishedTime: "2019-11-05T00:00:000Z"
    },
    {
      id: 2,
      type: "GENERIC_FROM",
      from: "Some Other Administrator",
      kind: "ANNOUNCEMENT",
      content: {
        type: "PLAIN_TEXT",
        text: "Some other message here"
      },
      publishedTime: "2019-11-11T00:00:000Z"
    }
  ];

  describe("canHandle", () => {
    it("returns false if needsPinLogin is true", () => {
      handlerInput.context.needsPinLogin = true;
      expect(GetSchoolCommunicationRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns false if token is empty", () => {
      handlerInput.context.token = null;
      expect(GetSchoolCommunicationRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns false if token is empty", () => {
      handlerInput.context.token = null;
      expect(GetSchoolCommunicationRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns false if header is empty", () => {
      handlerInput.requestEnvelope.request.header = null;
      expect(GetSchoolCommunicationRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns false if namespace is empty", () => {
      handlerInput.requestEnvelope.request.header.namespace = null;
      expect(GetSchoolCommunicationRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns false if name is empty", () => {
      handlerInput.requestEnvelope.request.header.name = null;
      expect(GetSchoolCommunicationRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns false if interfaceVersion is empty", () => {
      handlerInput.requestEnvelope.request.header.interfaceVersion = null;
      expect(GetSchoolCommunicationRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns false if namespace is not Alexa.Education.School.Communication", () => {
      handlerInput.requestEnvelope.request.header.namespace = "Alexa.Education.SomethingElse";
      expect(GetSchoolCommunicationRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns false if name is not Get", () => {
      handlerInput.requestEnvelope.request.header.name = "Post";
      expect(GetSchoolCommunicationRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns false if interfaceVersion is not 1.0", () => {
      handlerInput.requestEnvelope.request.header.interfaceVersion = "2.0";
      expect(GetSchoolCommunicationRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns true if needsPinLogin is false, token is present, and data matches", () => {
      expect(GetSchoolCommunicationRequestHandler.canHandle(handlerInput)).toBeTruthy();
    });
  });

  describe("handle", () => {
    it("returns empty response if there are no active courses if not given a student ID", async () => {
      handlerInput.requestEnvelope.request.payload.query.matchAll.courseId = 1;
      stubGetActiveCourses([]);
      const result = await GetSchoolCommunicationRequestHandler.handle(handlerInput);
      expect(result).toEqual(emptyOutput());
    });

    it("returns empty response if there are no active courses matching the courseId if not given a student ID", async () => {
      handlerInput.requestEnvelope.request.payload.query.matchAll.courseId = 3;
      stubGetActiveCourses(coursesData);
      const result = await GetSchoolCommunicationRequestHandler.handle(handlerInput);
      expect(result).toEqual(emptyOutput());
    });

    it("returns empty response if there are no active courses if given a student ID", async () => {
      handlerInput.requestEnvelope.request.payload.query.matchAll.studentId = 1;
      handlerInput.requestEnvelope.request.payload.query.matchAll.courseId = 1;
      stubGetActiveUserCourses([]);
      const result = await GetSchoolCommunicationRequestHandler.handle(handlerInput);
      expect(result).toEqual(emptyOutput());
    });

    it("returns empty response if there are no active courses matching the courseId if given a student ID", async () => {
      handlerInput.requestEnvelope.request.payload.query.matchAll.studentId = 1;
      handlerInput.requestEnvelope.request.payload.query.matchAll.courseId = 3;
      stubGetActiveUserCourses(coursesData);
      const result = await GetSchoolCommunicationRequestHandler.handle(handlerInput);
      expect(result).toEqual(emptyOutput());
    });

    it("returns announcements for the given student if given student ID", async () => {
      handlerInput.requestEnvelope.request.payload.query.matchAll.studentId = 1;
      stubGetActiveUserCourses(coursesData);
      stubGetAnnouncements({ announcements: announcementsData, nextToken: 2 });
      const result = await GetSchoolCommunicationRequestHandler.handle(handlerInput);
      expect(result).toEqual(formatOutput(announcementsResult));
    });

    it("returns announcements for the given student and course if given course ID and student ID", async () => {
      handlerInput.requestEnvelope.request.payload.query.matchAll.studentId = 1;
      handlerInput.requestEnvelope.request.payload.query.matchAll.courseId = 2;
      stubGetActiveUserCourses(coursesData);
      stubGetAnnouncements({ announcements: [announcementsData[1]], nextToken: 2 });
      const result = await GetSchoolCommunicationRequestHandler.handle(handlerInput);
      expect(result).toEqual(formatOutput([announcementsResult[1]]));
    });

    it("returns announcements for current student if not given student ID", async () => {
      stubGetActiveCourses(coursesData);
      stubGetAnnouncements({ announcements: announcementsData, nextToken: 2 });
      const result = await GetSchoolCommunicationRequestHandler.handle(handlerInput);
      expect(result).toEqual(formatOutput(announcementsResult));
    });

    it("returns announcements for the current student and given course if given course ID", async () => {
      handlerInput.requestEnvelope.request.payload.query.matchAll.courseId = 2;
      stubGetActiveCourses(coursesData);
      stubGetAnnouncements({ announcements: [announcementsData[1]], nextToken: 2 });
      const result = await GetSchoolCommunicationRequestHandler.handle(handlerInput);
      expect(result).toEqual(formatOutput([announcementsResult[1]]));
    });
  });
});
