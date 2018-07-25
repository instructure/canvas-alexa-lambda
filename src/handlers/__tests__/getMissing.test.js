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

it("says no no missing assignments if you have nothing missing", async () => {
  mock.onGet("/users/self/missing_submissions").reply(200, []);
  const result = await alexa.utter("Am i missing anything");
  const expected = expect.stringContaining("You have no missing assignments");
  expect(result.response.outputSpeech.ssml).toEqual(expected);
});

it("names two assignments that are missing", async () => {
  mock
    .onGet("/users/self/missing_submissions")
    .reply(200, [{ id: 1, name: "Chapter 1 Problems" }, { id: 2, name: "Chapter 2 Problems" }]);
  const result = await alexa.utter("Have i missed any assignments");
  const expected1 = expect.stringContaining("Yes");
  const expected2 = expect.stringContaining("Your assignment named Chapter 1 Problems is missing");
  const expected3 = expect.stringContaining(
    "Also Your assignment named Chapter 2 Problems is missing"
  );
  expect(result.response.outputSpeech.ssml).toEqual(expected1);
  expect(result.response.outputSpeech.ssml).toEqual(expected2);
  expect(result.response.outputSpeech.ssml).toEqual(expected3);
});

it("names two assignments  that are missing", async () => {
  mock
    .onGet("/users/self/missing_submissions")
    .reply(200, [
      { id: 1, name: "Chapter 1 Problems" },
      { id: 2, name: "Chapter 2 Problems" },
      { id: 3, name: "Chapter 3 Problems" },
      { id: 4, name: "Chapter 4 Problems" }
    ]);
  const result = await alexa.utter("What assignments are missing");
  const expected1 = expect.stringContaining("and 2 more");
  expect(result.response.outputSpeech.ssml).toEqual(expected1);
});
