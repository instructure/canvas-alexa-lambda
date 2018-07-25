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
var axios = require('axios');
var MockAdapter = require('axios-mock-adapter');


const alexa = virtualAlexa.VirtualAlexa.Builder()
    .handler("./src/index.handler")
    .intentSchemaFile("./alexa-config/intents.json")
    .sampleUtterancesFile("./alexa-config/utterances.txt")
    .applicationID('unit_test_app_id')
    .create();

alexa.filter((requestJSON) => {
  requestJSON.session.user.accessToken = "totally~a~real~host;totally~a~real~access~token"
})

test('test announcements intent when user has no announcements', (done) => {
  var mock = new MockAdapter(axios);
  mock.onGet('/courses?enrollment_state=active').reply(200, []);
  alexa.utter("Is there any news").then(payload => {
    const expected = "You have no announcements. Anything else?"
    expect(payload.response.outputSpeech.ssml).toEqual(expect.stringContaining(expected))
    done()
  })
})

test('test announcements intent when user has no announcements', (done) => {
  var mock = new MockAdapter(axios);
  mock.onGet('/courses?enrollment_state=active').reply(200, []);
  alexa.utter("Is there any news").then(payload => {
    const expected = "You have no announcements. Anything else?"
    expect(payload.response.outputSpeech.ssml).toEqual(expect.stringContaining(expected))
    done()
  })
})
