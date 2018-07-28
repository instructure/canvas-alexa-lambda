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
const parseDateSlot = require("../parseDateSlot");
const constantDate = new Date("2017-06-13T04:41:20");

it("test parseDateSlot 2015-11-24", async () => {
  const parseDateSlotDate = parseDateSlot("2015-11-24");
  expect(parseDateSlotDate.startDate.toString()).toBe(new Date("2015-11-24").toString());
  expect(parseDateSlotDate.endDate.toString()).toBe(new Date("2015-11-24").toString());
});

it("test parseDateSlot 2015-11", async () => {
  const expectedStartDate = new Date("2015-11-01");
  const expectedEndDate = new Date(2015, expectedStartDate.getMonth() + 1, 0);
  const parseDateSlotDate = parseDateSlot("2015-11");
  expect(parseDateSlotDate.startDate.toString()).toBe(expectedStartDate.toString());
  expect(parseDateSlotDate.endDate.toString()).toBe(expectedEndDate.toString());
});

it("test parseDateSlot 2015-W48", async () => {
  const expectedStartDate = new Date(2015, 0, 327);
  const expectedEndDate = new Date(2015, 0, 333);
  const parseDateSlotDate = parseDateSlot("2015-W48");
  expect(parseDateSlotDate.startDate.toString()).toBe(expectedStartDate.toString());
  expect(parseDateSlotDate.endDate.toString()).toBe(expectedEndDate.toString());
});

it("test parseDateSlot 2015-W48-WE", async () => {
  const expectedStartDate = new Date(2015, 0, 332);
  const expectedEndDate = new Date(2015, 0, 333);
  const parseDateSlotDate = parseDateSlot("2015-W48-WE");
  expect(parseDateSlotDate.startDate.toString()).toBe(expectedStartDate.toString());
  expect(parseDateSlotDate.endDate.toString()).toBe(expectedEndDate.toString());
});

it("test parseDateSlot PRESENT_REF", async () => {
  Date = class extends Date {
    constructor() {
      return constantDate;
    }
  };
  const parseDateSlotDate = parseDateSlot("PRESENT_REF");
  expect(parseDateSlotDate.startDate).toBe(new Date());
  expect(parseDateSlotDate.endDate).toBe(new Date());
});
