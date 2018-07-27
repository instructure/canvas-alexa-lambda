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
const createVirtualAlexa = require("../../test_utils/utils.js").createVirtualAlexa;
var axios = require("axios");
var MockAdapter = require("axios-mock-adapter");
const constantDate = new Date("2017-06-13T04:41:20");

/*eslint no-global-assign:off*/
Date = class extends Date {
  constructor() {
    return constantDate;
  }
};

beforeAll(() => {
  alexa = createVirtualAlexa();
  mock = new MockAdapter(axios);
});

afterEach(() => {
  mock.reset();
});

afterAll(() => {
  mock.restore();
});

it("test calendar events when there are no active courses", async () => {
  mock.onGet("/courses?enrollment_state=active&enrollment_type=student").reply(200, []);
  const result = await alexa.utter("What is on my calendar");
  expect(result).toMatchSnapshot();
});

it("test calendar events when there are events", async () => {
  mock
    .onGet("/courses?enrollment_state=active&enrollment_type=student")
    .reply(200, [{ id: 5, name: "temp course name 1" }, { id: 6, name: "temp course name 2" }]);

  mock
    .onGet(
      "/users/self/calendar_events?type=assignment&start_date=2017-08-13&end_date=2017-08-13&per_page=50&context_codes[]=course_5&context_codes[]=course_6"
    )
    .reply(200, [
      {
        title: "asdfasdfasdfsdf",
        workflow_state: "published",
        created_at: "2018-07-27T16:35:55Z",
        updated_at: "2018-07-27T16:35:55Z",
        all_day: true,
        all_day_date: "2018-07-28",
        description: null,
        id: "assignment_66",
        type: "assignment"
      }
    ]);
  const result = await alexa.utter("What is on my calendar");
  expect(result).toMatchSnapshot();
});

it("test the have no events response", async () => {
  mock
    .onGet("/courses?enrollment_state=active&enrollment_type=student")
    .reply(200, [{ id: 7, name: "temp course name 1" }, { id: 8, name: "temp course name 2" }]);

  mock
    .onGet(
      "/users/self/calendar_events?type=assignment&start_date=2017-09-13&end_date=2017-09-13&per_page=50&context_codes[]=course_7&context_codes[]=course_8"
    )
    .reply(200, []);
  const result = await alexa.utter("What is on my calendar");
  expect(result).toMatchSnapshot();
});
