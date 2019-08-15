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
const axios = require("axios");
const MockAdapter = require("axios-mock-adapter");
const createVirtualAlexa = require("../../test_utils/utils.js").createVirtualAlexa;

let mock;

beforeAll(() => {
  mock = new MockAdapter(axios);
});

afterEach(() => {
  mock.reset();
});

afterAll(() => {
  mock.restore();
});

test("test getUngradedSubmissions login", async () => {
  const alexa = createVirtualAlexa({ fakeAccessToken: false });
  const result = await alexa.utter("What submissions do I have to grade");
  const expected = "You need to login with Canvas to use this skill.";
  expect(result.response.outputSpeech.ssml).toEqual(expect.stringContaining(expected));
});

it("test getUngradedSubmissions with no active courses", async () => {
  const alexa = createVirtualAlexa();
  mock.onGet("/courses?enrollment_state=active&enrollment_type=teacher").reply(200, []);
  const result = await alexa.utter("What submissions do I have to grade");
  expect(result).toMatchSnapshot();
});

it("test getUngradedSubmissions with no submissions", async () => {
  const alexa = createVirtualAlexa();
  mock
    .onGet("/courses?enrollment_state=active&enrollment_type=teacher")
    .reply(200, [{ id: 1, name: "course name" }]);
  mock.onGet("/courses/1/students/submissions?student_ids[]=all&per_page=100").reply(200, []);
  const result = await alexa.utter("What submissions do I have to grade");
  expect(result).toMatchSnapshot();
});

it("test getUngradedSubmissions with 2 courses with no submissions", async () => {
  const alexa = createVirtualAlexa();
  mock
    .onGet("/courses?enrollment_state=active&enrollment_type=teacher")
    .reply(200, [{ id: 1, name: "course name" }, { id: 2, name: "course name 2" }]);
  mock.onGet("/courses/1/students/submissions?student_ids[]=all&per_page=100").reply(200, []);
  mock.onGet("/courses/2/students/submissions?student_ids[]=all&per_page=100").reply(200, []);
  const result = await alexa.utter("What submissions do I have to grade");
  expect(result).toMatchSnapshot();
});

it("test getUngradedSubmissions with 2 submissions", async () => {
  const alexa = createVirtualAlexa();
  mock
    .onGet("/courses?enrollment_state=active&enrollment_type=teacher")
    .reply(200, [{ id: 1, name: "course name" }]);
  mock
    .onGet("/courses/1/students/submissions?student_ids[]=all&per_page=100")
    .reply(200, [
      { id: 5, workflow_state: "submitted", grade: null },
      { id: 5, workflow_state: "submitted", grade: null }
    ]);
  const result = await alexa.utter("What submissions do I have to grade");
  expect(result).toMatchSnapshot();
});
