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
module.exports = {
  GetAnnouncements: async function () {
    // grab active student enrollments
    const activeCoursesResp = await this.context.api.getActiveCourses()
    if (activeCoursesResp.data.length === 0) {
      this.emit('TellAndContinue', 'You have no active courses')
      return
    }
    const courses = activeCoursesResp.data.map(course => ({ course_code: `course_${course.id}`, course }))
    const announcementsResp = await this.context.api.getAnnouncements({ contextCodes: courses.map(c => c.course_code) })
    const announcements = announcementsResp.data
    if (announcements.length === 0) {
      this.emit('TellAndContinue', 'You have no announcements')
      return
    }
    const result = courses.reduce((obj, item) => {
      obj[item.course_code] = item.course
      return obj
    }, {})
    const annSpeech = announcements.map(
      ann => `In course ${result[ann.context_code].name}: ${ann.title}`
    ).join(',\n')
    const speechOutput = `Here are your announcements: ${annSpeech}`
    this.emit('TellAndContinue', speechOutput)
  },
}
