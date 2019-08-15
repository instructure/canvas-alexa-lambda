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

test("test missing assignments login", async () => {
  const alexa = createVirtualAlexa({ fakeAccessToken: false });
  const result = await alexa.utter("Am i missing anything");
  const expected = "You need to login with Canvas to use this skill.";
  expect(result.response.outputSpeech.ssml).toEqual(expect.stringContaining(expected));
});

it("says no no missing assignments if you have nothing missing", async () => {
  const alexa = createVirtualAlexa();
  mock.onGet("/users/self/missing_submissions").reply(200, []);
  const result = await alexa.utter("Am i missing anything");
  expect(result).toMatchSnapshot();
});

it("names two assignments that are missing", async () => {
  const alexa = createVirtualAlexa();
  mock
    .onGet("/users/self/missing_submissions")
    .reply(200, [{ id: 1, name: "Chapter 1 Problems" }, { id: 2, name: "Chapter 2 Problems" }]);
  const result = await alexa.utter("Have i missed any assignments");
  expect(result).toMatchSnapshot();
});

it("names two assignments  that are missing", async () => {
  const alexa = createVirtualAlexa();
  mock
    .onGet("/users/self/missing_submissions")
    .reply(200, [
      { id: 1, name: "Chapter 1 Problems" },
      { id: 2, name: "Chapter 2 Problems" },
      { id: 3, name: "Chapter 3 Problems" },
      { id: 4, name: "Chapter 4 Problems" }
    ]);
  const result = await alexa.utter("What assignments are missing");
  expect(result).toMatchSnapshot();
});

it("convert & to and for missing assignments", async () => {
  const alexa = createVirtualAlexa();
  mock
    .onGet("/users/self/missing_submissions")
    .reply(200, [{ id: 1, name: "Chapter 1 & Problems" }, { id: 4, name: "Chapter 4 & Problems" }]);
  const result = await alexa.utter("What assignments are missing");
  expect(result).toMatchSnapshot();
});
