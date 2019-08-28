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
const GetCourseworkRequestHandler = require("../getCoursework");

Date = class extends Date {
  constructor() {
    return constantDate;
  }
};

describe("GetCoursework", () => {
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
            namespace: "Alexa.Education.Coursework",
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
              matchAll: {
                studentId: 1,
                courseworkType: "ASSIGNMENT",
                dueTime: {
                  start: "2018-06-05T00:00:000Z",
                  end: "2020-11-30T00:00:000Z"
                }
              }
            }
          }
        }
      }
    };
  });

  stubGetActiveUserCourses = data => {
    mockApi.getActiveUserCourses = sinon
      .stub()
      .withArgs(1)
      .resolves({ data });
  };

  stubGetCalendarEvents = data => {
    mockApi.getCalendarEvents = sinon.stub().resolves(data);
  };

  formatOutput = data => {
    return {
      header: {
        namespace: "Alexa.Education.Coursework",
        name: "GetResponse",
        messageId: 123,
        interfaceVersion: "1.0"
      },
      payload: {
        paginationContext: {
          totalCount: data.length,
          nextToken: "2"
        },
        coursework: data
      }
    };
  };

  const coursesData = [{ id: 1, name: "Course 1" }, { id: 2, name: "Course 2" }];
  const courseworkData = [
    {
      assignment: {
        id: 1,
        course_id: 1,
        submission_types: ["online_quiz"],
        due_at: "2019-06-05T00:00:000Z"
      },
      title: "Quiz 1",
      description: "<p>Some Description</p>"
    },
    {
      assignment: {
        id: 2,
        course_id: 2,
        submission_types: ["online_text_entry"],
        due_at: "2019-11-05T00:00:000Z"
      },
      title: "Assignment 1",
      description: "<p>Some Description</p>"
    }
  ];
  const courseworkResult = [
    {
      id: 1,
      courseId: 1,
      courseName: "Course 1",
      title: "Quiz 1",
      description: "<p>Some Description</p>",
      type: "ASSESSMENT",
      dueTime: "2019-06-05T00:00:000Z"
    },
    {
      id: 2,
      courseId: 2,
      courseName: "Course 2",
      title: "Assignment 1",
      description: "<p>Some Description</p>",
      type: "ASSIGNMENT",
      dueTime: "2019-11-05T00:00:000Z"
    }
  ];

  describe("canHandle", () => {
    it("returns false if needsPinLogin is true", () => {
      handlerInput.context.needsPinLogin = true;
      expect(GetCourseworkRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns false if token is empty", () => {
      handlerInput.context.token = null;
      expect(GetCourseworkRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns false if token is empty", () => {
      handlerInput.context.token = null;
      expect(GetCourseworkRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns false if header is empty", () => {
      handlerInput.requestEnvelope.request.header = null;
      expect(GetCourseworkRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns false if namespace is empty", () => {
      handlerInput.requestEnvelope.request.header.namespace = null;
      expect(GetCourseworkRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns false if name is empty", () => {
      handlerInput.requestEnvelope.request.header.name = null;
      expect(GetCourseworkRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns false if interfaceVersion is empty", () => {
      handlerInput.requestEnvelope.request.header.interfaceVersion = null;
      expect(GetCourseworkRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns false if namespace is not Alexa.Education.Coursework", () => {
      handlerInput.requestEnvelope.request.header.namespace = "Alexa.Education.SomethingElse";
      expect(GetCourseworkRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns false if name is not Get", () => {
      handlerInput.requestEnvelope.request.header.name = "Post";
      expect(GetCourseworkRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns false if interfaceVersion is not 1.0", () => {
      handlerInput.requestEnvelope.request.header.interfaceVersion = "2.0";
      expect(GetCourseworkRequestHandler.canHandle(handlerInput)).toBeFalsy();
    });

    it("returns true if needsPinLogin is false, token is present, and data matches", () => {
      expect(GetCourseworkRequestHandler.canHandle(handlerInput)).toBeTruthy();
    });
  });

  describe("handle", () => {
    it("returns empty object if there are no active courses", async () => {
      stubGetActiveUserCourses([]);
      const result = await GetCourseworkRequestHandler.handle(handlerInput);
      expect(result).toEqual({});
    });

    it("returns empty object if there are no active courses matching the courseId", async () => {
      handlerInput.requestEnvelope.request.payload.query.matchAll.courseId = 3;
      stubGetActiveUserCourses(coursesData);
      const result = await GetCourseworkRequestHandler.handle(handlerInput);
      expect(result).toEqual({});
    });

    it("returns coursework for the given set of courses and studentId", async () => {
      handlerInput.requestEnvelope.request.payload.query.matchAll.courseId = 2;
      stubGetActiveUserCourses(coursesData);
      stubGetCalendarEvents({ events: [courseworkData[1]], nextToken: 2 });
      const result = await GetCourseworkRequestHandler.handle(handlerInput);
      expect(result).toEqual(formatOutput([courseworkResult[1]]));
    });
  });
});
