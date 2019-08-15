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

const crazyPhrases = [
  "You must be crazy",
  "You need help",
  "Seek help",
  "I do not think you are in a right state of mind",
  "You are not using this right"
];

test("testeastereggintentlogin", async () => {
  const alexa = createVirtualAlexa({ fakeAccessToken: false });
  const result = await alexa.utter("Blackboard is better");
  const expected = "You need to login with Canvas to use this skill.";
  expect(result.response.outputSpeech.ssml).toEqual(expect.stringContaining(expected));
});

test("testeastereggintent", async () => {
  const alexa = createVirtualAlexa();
  const result = await alexa.utter("Blackboard is better");
  var returnedCrazyPhrase = false;
  crazyPhrases.forEach(function(element) {
    if (result.response.outputSpeech.ssml.indexOf(element) > -1) {
      returnedCrazyPhrase = true;
    }
  });
  expect(returnedCrazyPhrase).toEqual(true);
});
