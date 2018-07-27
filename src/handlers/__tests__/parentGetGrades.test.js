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
const virtualAlexa = require("virtual-alexa");
const axios = require("axios");
const MockAdapter = require("axios-mock-adapter");

const makeCourseUrl = id => {
  return `/users/${id}/courses?enrollment_state=active&include[]=total_scores`;
};

let mock;
let alexa;

beforeAll(() => {
  mock = new MockAdapter(axios);

  alexa = virtualAlexa.VirtualAlexa.Builder()
    .handler("./src/index.handler")
    .intentSchemaFile("./alexa-config/intents.json")
    .sampleUtterancesFile("./alexa-config/utterances.txt")
    .applicationID("1")
    .create();

  alexa.filter(requestJSON => {
    requestJSON.session.user.accessToken = "totally~a~real~host;totally~a~real~access~token";
  });
});

afterEach(() => {
  mock.reset();
});

afterAll(() => {
  mock.restore();
});

it("says no students found if you have no observees", async () => {
  mock.onGet("/users/self/observees").reply(200, []);
  const result = await alexa.utter("What are my kid's grades");
  expect(result).toMatchSnapshot();
});

it("says no students matching name found if are not an observees for the specific student", async () => {
  mock.onGet("/users/self/observees").reply(200, []);
  const result = await alexa.utter("What are landons grades");
  expect(result).toMatchSnapshot();
});

it("announces details for multiple students", async () => {
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
