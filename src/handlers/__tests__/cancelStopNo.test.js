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
let alexa;

beforeAll(() => {
  alexa = createVirtualAlexa();
});

it.skip("launch the cancel intent", async () => {
  const result = await alexa.utter("Cancel");
  expect(result).toMatchSnapshot();
});

it.skip("launch the stop intent", async () => {
  const result = await alexa.utter("Stop");
  expect(result).toMatchSnapshot();
});

it.skip("launch the no intent", async () => {
  const result = await alexa.utter("No");
  expect(result).toMatchSnapshot();
});
