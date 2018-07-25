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

const alexa = virtualAlexa.VirtualAlexa.Builder()
  .handler("./src/index.handler")
  .intentSchemaFile("./alexa-config/intents.json")
  .sampleUtterancesFile("./alexa-config/utterances.txt")
  .applicationID("1")
  .create();

alexa.filter(requestJSON => {
  requestJSON.session.user.accessToken = "totally~a~real~host;totally~a~real~access~token";
});

const crazyPhrases = [
  "You must be crazy",
  "You need help",
  "Seek help",
  "I do not think you are in a right state of mind",
  "You are not using this right"
];

test("testeastereggintent", async () => {
  const result = await alexa.utter("Blackboard is better");
  var returnedCrazyPhrase = false;
  crazyPhrases.forEach(function(element) {
    if (result.response.outputSpeech.ssml.indexOf(element) > -1) {
      returnedCrazyPhrase = true;
    }
  });
  expect(returnedCrazyPhrase).toEqual(true);
});
