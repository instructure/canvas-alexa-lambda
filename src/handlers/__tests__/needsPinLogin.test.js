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
let alexa;

beforeAll(() => {
  alexa = createVirtualAlexa({ fakeAccessToken: false });
  mock = new MockAdapter(axios);

  // Set this up so it requires a pin
  alexa.filter(requestJSON => {
    requestJSON.session.development = true;
    requestJSON.session.user.accessToken = "PIN_REFRESH_ONLY_TOKENlocalhost;fake-access-token";
  });
});

afterEach(() => {
  mock.reset();
});

afterAll(() => {
  mock.restore();
});

it("does not let you do other intents until you verify the pin", async () => {
  const result = await alexa.utter("Blackboard is better");
  expect(result).toMatchSnapshot();
});
