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
var axios = require("axios");
var MockAdapter = require("axios-mock-adapter");
let mock;
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
  mock = new MockAdapter(axios);
});

afterEach(() => {
  mock.reset();
});

afterAll(() => {
  mock.restore();
});

it("test announcements intent when user has no active courses", async () => {
  mock.onGet("/courses?enrollment_state=active").reply(200, []);
  const result = await alexa.utter("Is there any news");
  expect(result).toMatchSnapshot();
});

it("test announcements intent when user has no announcements", async () => {
  mock
    .onGet("/courses?enrollment_state=active")
    .reply(200, [{ id: 5, name: "temp course name 1" }, { id: 6, name: "temp course name 2" }]);
  mock
    .onGet("/announcements?active_only=true&context_codes[]=course_5&context_codes[]=course_6")
    .reply(200, []);
  const result = await alexa.utter("Is there any news");
  expect(result).toMatchSnapshot();
});

it("test announcements intent when user has announcements", async () => {
  mock
    .onGet("/courses?enrollment_state=active")
    .reply(200, [{ id: 5, name: "temp course name 1" }, { id: 6, name: "temp course name 2" }]);
  mock
    .onGet("/announcements?active_only=true&context_codes[]=course_5&context_codes[]=course_6")
    .reply(200, [
      { id: 5, title: "temp announcement named blah", context_code: "course_6" },
      { id: 6, title: "temp announcement named blee", context_code: "course_5" }
    ]);
  const result = await alexa.utter("Is there any news");
  expect(result).toMatchSnapshot();
});
