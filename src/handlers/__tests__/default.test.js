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
let alexa;

beforeAll(() => {
  alexa = virtualAlexa.VirtualAlexa.Builder()
    .handler("./src/index.handler")
    .intentSchemaFile("./alexa-config/intents.json")
    .sampleUtterancesFile("./alexa-config/utterances.txt")
    .applicationID("1")
    .create();

  alexa.filter(requestJSON => {
    requestJSON.session.user.accessToken = "totally~a~real~host;totally~a~real~access~token";
    requestJSON.session.development = true;
  });
});

it("launch the cancel intent", async () => {
  const result = await alexa.utter("Cancel");
  const expected = "Goodbye!";
  expect(result.response.outputSpeech.ssml).toEqual(expect.stringContaining(expected));
});

it("launch the stop intent", async () => {
  const result = await alexa.utter("Stop");
  const expected = "Goodbye!";
  expect(result.response.outputSpeech.ssml).toEqual(expect.stringContaining(expected));
});

it("launch the no intent", async () => {
  const result = await alexa.utter("No");
  const expected = "Goodbye!";
  expect(result.response.outputSpeech.ssml).toEqual(expect.stringContaining(expected));
});

it("launch the help intent", async () => {
  const result = await alexa.utter("Help");
  const expected = "You can ask to list grades, or check if you have any missing assignments.";
  expect(result.response.outputSpeech.ssml).toEqual(expect.stringContaining(expected));
});

it("launch the launch intent", async () => {
  const result = await alexa.launch();
  const expected = "You can ask to list grades, or check if you have any missing assignments.";
  expect(result.response.outputSpeech.ssml).toEqual(expect.stringContaining(expected));
});
