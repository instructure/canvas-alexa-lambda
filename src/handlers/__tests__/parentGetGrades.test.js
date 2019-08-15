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

const makeCourseUrl = id => {
  return `/users/${id}/courses?enrollment_state=active&include[]=total_scores`;
};

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

test("test parentGetGrades login", async () => {
  const alexa = createVirtualAlexa({ fakeAccessToken: false });
  const result = await alexa.utter("What are my kid's grades");
  const expected = "You need to login with Canvas to use this skill.";
  expect(result.response.outputSpeech.ssml).toEqual(expect.stringContaining(expected));
});

it("says no students found if you have no observees", async () => {
  const alexa = createVirtualAlexa();
  mock.onGet("/users/self/observees").reply(200, []);
  const result = await alexa.utter("What are my kid's grades");
  expect(result).toMatchSnapshot();
});

it("says no students matching name found if are not an observees for the specific student", async () => {
  const alexa = createVirtualAlexa();
  mock.onGet("/users/self/observees").reply(200, []);
  const result = await alexa.utter("What are landons grades");
  expect(result).toMatchSnapshot();
});

it("announces details for multiple students", async () => {
  const alexa = createVirtualAlexa();
  mock
    .onGet("/users/self/observees")
    .reply(200, [{ id: 1, short_name: "Billy" }, { id: 2, short_name: "Bob" }]);
  mock.onGet(makeCourseUrl(1)).reply(200, []);
  mock.onGet(makeCourseUrl(2)).reply(200, [
    {
      name: "Calculus",
      enrollments: [{ computed_current_score: "93" }]
    }
  ]);

  const result = await alexa.utter("What are my kid's grades");
  expect(result).toMatchSnapshot();
});

it("filters students based on studentNameSlot", async () => {
  const alexa = createVirtualAlexa();
  mock
    .onGet("/users/self/observees")
    .reply(200, [{ id: 1, short_name: "Billy" }, { id: 2, short_name: "Bob" }]);
  mock.onGet(makeCourseUrl(1)).reply(200, []);
  mock.onGet(makeCourseUrl(2)).reply(200, [
    {
      name: "Calculus",
      enrollments: [{ computed_current_score: "93" }]
    }
  ]);

  const result = await alexa.utter("What are Bobs grades");
  expect(result).toMatchSnapshot();
});

it("filters students based on courseNameSlot", async () => {
  const alexa = createVirtualAlexa();
  mock
    .onGet("/users/self/observees")
    .reply(200, [{ id: 1, short_name: "Billy" }, { id: 2, short_name: "Bob" }]);
  mock.onGet(makeCourseUrl(1)).reply(200, []);
  mock.onGet(makeCourseUrl(2)).reply(200, [
    {
      name: "Calculus",
      enrollments: [{ computed_current_score: "93" }]
    }
  ]);

  const result = await alexa.utter("What are my kids grades in calculus");
  expect(result).toMatchSnapshot();
});

it("respond correctly when they don't have any course enrollments", async () => {
  const alexa = createVirtualAlexa();
  mock
    .onGet("/users/self/observees")
    .reply(200, [{ id: 1, short_name: "Billy" }, { id: 2, short_name: "Bob" }]);
  mock.onGet(makeCourseUrl(1)).reply(200, []);
  mock.onGet(makeCourseUrl(2)).reply(200, [
    {
      name: "Calculus",
      enrollments: []
    }
  ]);

  const result = await alexa.utter("What are my kids grades in calculus");
  expect(result).toMatchSnapshot();
});
