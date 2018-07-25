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
const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');

const makeCourseUrl = id => {
  return `/users/${id}/courses?enrollment_state=active&include[]=total_scores`
}

let mock
let alexa

beforeAll(() => {
  mock = new MockAdapter(axios)

  alexa = virtualAlexa.VirtualAlexa.Builder()
    .handler("./src/index.handler")
    .intentSchemaFile("./alexa-config/intents.json")
    .sampleUtterancesFile("./alexa-config/utterances.txt")
    .applicationID('unit_test_app_id')
    .create();

  alexa.filter((requestJSON) => {
    requestJSON.session.user.accessToken = "totally~a~real~host;totally~a~real~access~token"
  })
})

afterEach(() => {
  mock.reset()
})

afterAll(() => {
  mock.restore()
})

it('says no students found if you have no observees', async () => {
  mock.onGet('/users/self/observees').reply(200, []);
  const result = await alexa.utter("What are my kid's grades")
  const expected = expect.stringContaining("No students found")
  expect(result.response.outputSpeech.ssml).toEqual(expected)
})

it('says no students matching name found if are not an observees for the specific student', async () => {
  mock.onGet('/users/self/observees').reply(200, []);
  const result = await alexa.utter("What are landons grades")
  const expected = expect.stringContaining("No matching students found")
  expect(result.response.outputSpeech.ssml).toEqual(expected)
})

it('announces details for multiple students', async () => {
  mock.onGet('/users/self/observees').reply(200, [
    {id: 1, short_name: 'Billy'},
    {id: 2, short_name: 'Bob'}
  ])
  mock.onGet(makeCourseUrl(1)).reply(200, [])
  mock.onGet(makeCourseUrl(2)).reply(200, [
    {
      name: 'Calculus',
      enrollments: [{ computed_current_score: '93' }]
    }
  ])

  const result = await alexa.utter("What are my kid's grades")
  const expected1 = expect.stringContaining("Here are your students grades")
  const expected2 = expect.stringContaining("For Billy: No course found")
  const expected3 = expect.stringContaining("For Bob: In Calculus: the grade is 93")
  expect(result.response.outputSpeech.ssml).toEqual(expected1)
  expect(result.response.outputSpeech.ssml).toEqual(expected2)
  expect(result.response.outputSpeech.ssml).toEqual(expected3)
})

it('filters students based on studentNameSlot', async () => {
  mock.onGet('/users/self/observees').reply(200, [
    {id: 1, short_name: 'Billy'},
    {id: 2, short_name: 'Bob'}
  ])
  mock.onGet(makeCourseUrl(1)).reply(200, [])
  mock.onGet(makeCourseUrl(2)).reply(200, [
    {
      name: 'Calculus',
      enrollments: [{ computed_current_score: '93' }]
    }
  ])

  const result = await alexa.utter("What are Bobs grades")
  const expected1 = expect.stringContaining("Here are your students grades")
  const expected2 = expect.stringContaining("For Bob: In Calculus: the grade is 93")
  const expected3 = expect.not.stringContaining("Billy")
  expect(result.response.outputSpeech.ssml).toEqual(expected1)
  expect(result.response.outputSpeech.ssml).toEqual(expected2)
  expect(result.response.outputSpeech.ssml).toEqual(expected3)
})

it('filters students based on courseNameSlot', async () => {
  mock.onGet('/users/self/observees').reply(200, [
    {id: 1, short_name: 'Billy'},
    {id: 2, short_name: 'Bob'}
  ])
  mock.onGet(makeCourseUrl(1)).reply(200, [])
  mock.onGet(makeCourseUrl(2)).reply(200, [
    {
      name: 'Calculus',
      enrollments: [{ computed_current_score: '93' }]
    }
  ])

  const result = await alexa.utter("What are my kids grades in calculus")
  const expected1 = expect.stringContaining("Here are your students grades")
  const expected2 = expect.stringContaining("For Bob: In Calculus: the grade is 93")
  const expected3 = expect.stringContaining("For Billy: No matching course found")
  expect(result.response.outputSpeech.ssml).toEqual(expected1)
  expect(result.response.outputSpeech.ssml).toEqual(expected2)
  expect(result.response.outputSpeech.ssml).toEqual(expected3)
})
