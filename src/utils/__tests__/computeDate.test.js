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
const computeDate = require("../computeDate");

it("test firstOfMonth date helper", async () => {
  const testDate = new Date("2015-11-24");
  const expectedDate = new Date(2015, 10, 1);
  const firstOfMonthDate = computeDate.firstOfMonth(testDate);
  expect(firstOfMonthDate.toString()).toBe(expectedDate.toString());
});

it("test lastOfMonth date helper", async () => {
  const testDate = new Date("2015-11-24");
  const expectedDate = new Date(2015, testDate.getMonth() + 1, 0);
  const lastOfMonthDate = computeDate.lastOfMonth(testDate);
  expect(lastOfMonthDate.toString()).toBe(expectedDate.toString());
});

it("test dateFromWeek date helper", async () => {
  const expectedDate = new Date(2015, 0, 304);
  const dateFromWeekDate = computeDate.dateFromWeek(2015, 44, 5);
  expect(dateFromWeekDate.toString()).toBe(expectedDate.toString());
});
