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
    .applicationID('unit_test_app_id')
    .create();


test('It will tell you to login if you do not already have an access token', (done) => {
  alexa.utter("Tell me my grades").then(payload => {
    const expected = "You need to login with Canvas to use this skill."
    expect(payload.response.outputSpeech.ssml).toEqual(expect.stringContaining(expected))
    done()
  })
})


/*
alexa.filter((requestJSON) => {
  requestJSON.session.user.accessToken = "totally~a~real~host;totally~a~real~access~token"
})
alexa.resetFilter()
*/
