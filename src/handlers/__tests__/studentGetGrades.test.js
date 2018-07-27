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
  alexa = createVirtualAlexa();
  mock = new MockAdapter(axios);
});

afterEach(() => {
  mock.reset();
});

afterAll(() => {
  mock.restore();
});

it("tells you if you are in no courses", async () => {
  const url = "/courses?enrollment_state=active&include[]=total_scores&enrollment_type=student";
  mock.onGet(url).reply(200, []);
  const result = await alexa.utter("What are my grades");
  expect(result).toMatchSnapshot();
});

it("tells you grades for multiple courses", async () => {
  const url = "/courses?enrollment_state=active&include[]=total_scores&enrollment_type=student";
  mock.onGet(url).reply(200, [
    {
      name: "test course 1",
      enrollments: [{ computed_current_grade: "A-" }]
    },
    {
      name: "test course 2",
      enrollments: [{ computed_current_score: "91%" }]
    },
    {
      name: "test course 3",
      enrollments: []
    }
  ]);
  const result = await alexa.utter("What are my grades");
  expect(result).toMatchSnapshot();
});

it("tells you your grades for a specific class using computed grades", async () => {
  const url = "/courses?enrollment_state=active&include[]=total_scores&enrollment_type=student";
  mock.onGet(url).reply(200, [
    {
      name: "Calculus",
      enrollments: [{ computed_current_grade: "A-" }]
    },
    {
      name: "Writing",
      enrollments: [{ computed_current_score: "91%" }]
    }
  ]);
  const result = await alexa.utter("What is my Calculus grade");
  expect(result).toMatchSnapshot();
});

it("tells you your grades for a specific class using computed grades", async () => {
  const url = "/courses?enrollment_state=active&include[]=total_scores&enrollment_type=student";
  mock.onGet(url).reply(200, [
    {
      name: "Calculus",
      enrollments: [{ computed_current_score: "A-" }]
    },
    {
      name: "Writing",
      enrollments: [{ computed_current_score: "91%" }]
    }
  ]);
  const result = await alexa.utter("What is my Writing grade");
  expect(result).toMatchSnapshot();
});

it("tells you no grades posted yet for a specific class", async () => {
  const url = "/courses?enrollment_state=active&include[]=total_scores&enrollment_type=student";
  mock.onGet(url).reply(200, [
    {
      name: "Calculus",
      enrollments: []
    },
    {
      name: "Writing",
      enrollments: [{ computed_current_score: "91%" }]
    }
  ]);
  const result = await alexa.utter("What is my Calculus grade");
  expect(result).toMatchSnapshot();
});

it("does not tels you your grades for a specific class you are not in", async () => {
  const url = "/courses?enrollment_state=active&include[]=total_scores&enrollment_type=student";
  mock.onGet(url).reply(200, [
    {
      name: "Calculus",
      enrollments: [{ computed_current_grade: "A-" }]
    },
    {
      name: "Writing",
      enrollments: [{ computed_current_score: "91%" }]
    }
  ]);
  const result = await alexa.utter("What is my Banana grade");
  expect(result).toMatchSnapshot();
});
