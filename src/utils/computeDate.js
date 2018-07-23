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
exports.oneMonthInTheFuture = function oneMonthInTheFuture (date) {
  // create a new date from the given date (so we can mutate it)
  // use setMonth to change months on the new date by adding 1 to given date
  // store the result of that (unix time) in a new date obj and return it
  return new Date((new Date(date.getTime())).setMonth(date.getMonth() + 1))
}

exports.firstOfMonth = function firstOfMonth (date) {
  // go to 1st of current month
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

exports.lastOfMonth = function firstOfMonth (date) {
  // go one month forward and one day backwards
  // days start at 1, so here 0 forces a day backwards
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

// gives you the date based on year and week number with optional day
// week day starts with monday, so day index starts with monday === 0
exports.dateFromWeek = function dateFromWeek (year, week, day = 0) {
  const dayOffset = 2 + day + (week - 1) * 7 - (new Date(year, 0, 1)).getDay()
  return new Date(year, 0, dayOffset)
}
