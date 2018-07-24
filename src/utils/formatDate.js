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
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

exports.forAPI = function formatForAPI (date) {
  return date.toISOString().slice(0, 10)
}

exports.forSpeech = function formatForSpeech (date) {
  const monthDay = date.getDate()
  const weekDay = days[ date.getDay() ]
  const month = months[ date.getMonth() ]
  return `${weekDay} ${month} ${monthDay}`
}

exports.rangeForSpeech = function formatRangeForSpeech (startDate, endDate) {
  // start and end are the same
  if (startDate.getTime() === endDate.getTime()) {
    return exports.forSpeech(startDate)
  } else {
    return `${exports.forSpeech(startDate)} to ${exports.forSpeech(endDate)}`
  }
}
