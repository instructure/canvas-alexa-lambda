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
const createVirtualAlexa = require("../test_utils/utils.js").createVirtualAlexa;

beforeAll(() => {
  alexa = createVirtualAlexa({ fakeAccessToken: false });
});

it("It will tell you to login if you do not already have an access token", async () => {
  const result = await alexa.utter("Tell me my grades");
  const expected = "You need to login with Canvas to use this skill.";
  expect(result.response.outputSpeech.ssml).toEqual(expect.stringContaining(expected));
});
