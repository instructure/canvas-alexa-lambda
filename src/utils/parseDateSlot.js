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
const { dateFromWeek, lastOfMonth } = require('./computeDate')

// gives you a start and end date for a given date slot value
module.exports = function parseDateSlot (slotValue, defaults = {}) {
  // defaults for no date or if no group matches
  let startDate = defaults.startDate || new Date()
  let endDate = defaults.startDate || new Date()

  // handle no date here, it will use defaults defined above
  if (!slotValue) {}

  // if singular date use [date - date] (ex: 2015-11-24)
  else if (slotValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
    startDate = new Date(slotValue)
    endDate = new Date(slotValue)
  }

  // if month use [first of month - last of month] (ex: 2015-11)
  else if (slotValue.match(/^\d{4}-\d{2}$/)) {
    startDate = new Date(`${slotValue}-01`)
    endDate = lastOfMonth(startDate)
  }

  // if week use [monday - sunday] (ex: 2015-W48)
  else if (slotValue.match(/^\d{4}-W\d{2}$/)) {
    const [ year, week ] = slotValue.split('-W')
    startDate = dateFromWeek(year, week)
    endDate = dateFromWeek(year, week, 6) // 6 is sunday here
  }

  // if weekend use [saturday - sunday] (ex: 2015-W48-WE)
  else if (slotValue.match(/^\d{4}-W\d{2}-WE$/)) {
    const [ year, week ] = slotValue.split('-W')
    startDate = dateFromWeek(year, week, 5) // 5 is saturday here
    endDate = dateFromWeek(year, week, 6) // 6 is sunday here
  }

  // if right now [today - today]
  else if (slotValue === 'PRESENT_REF') {
    startDate = new Date()
    endDate = new Date()
  }

  return { startDate, endDate }
}
