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
const formatDate = require("../utils/formatDate");
const parseDateSlot = require("../utils/parseDateSlot");
const parseCourseSlot = require("../utils/parseCourseSlot");
const { oneMonthInTheFuture } = require("../utils/computeDate");

module.exports = {
  GetCalendarEvents: async function() {
    const courseSlot = this.event.request.intent.slots.Course.value;
    const dateSlot = this.event.request.intent.slots.Date.value;
    const { startDate, endDate } = parseDateSlot(dateSlot, {
      // default to one month in future if no date slot passed in
      endDate: oneMonthInTheFuture(new Date())
    });

    let targetCourse = null;

    // grab active student enrollments
    const activeStudentCoursesResonse = await this.context.api.getActiveStudentCourses();
    const matchingCourses = courseSlot
      ? parseCourseSlot(activeStudentCoursesResonse.data, courseSlot).slice(0, 1)
      : activeStudentCoursesResonse.data;

    if (!matchingCourses.length) {
      let speechResponse = `You have no events for ${formatDate.rangeForSpeech(
        startDate,
        endDate
      )}`;
      this.emit("TellAndContinue", speechResponse);
      return;
    }
    targetCourse = courseSlot ? matchingCourses[0].name : null;
    const contextCodes = matchingCourses
      // maybe FIXME: there's a weird course on siteadmin accounts where
      // the course id === the root account id and including it with calendar
      // API causes a 401, so this removes the course, sorta hacky
      .filter(course => course.id !== course.root_account_id)
      .map(course => `course_${course.id}`);

    // grab calendar events for the next month for active student enrollments
    const calendarEventsResponse = await this.context.api.getCalendarEvents({
      contextCodes,
      startDate: formatDate.forAPI(startDate),
      endDate: formatDate.forAPI(endDate)
    });

    const eventsByDate = calendarEventsResponse.data.reduce((dateMap, { all_day_date, title }) => {
      dateMap[all_day_date] = dateMap[all_day_date] || [];
      dateMap[all_day_date].push(title);
      return dateMap;
    }, {});
    // formulate our response
    const dates = Object.keys(eventsByDate).map(date => ({
      date,
      label: formatDate.forSpeech(new Date(date))
    }));

    let speechResponse = null;
    const courseSuffix = targetCourse ? ` in ${targetCourse}` : "";

    if (dates.length) {
      speechResponse = `Here are your events for ${formatDate.rangeForSpeech(
        startDate,
        endDate
      )}${courseSuffix}: `;
      dates.forEach(({ label, date }) => {
        speechResponse += `On ${label}: `;
        eventsByDate[date].forEach(event => {
          speechResponse += event + ".\n";
        });
      });
    } else {
      speechResponse = `You have no events for ${formatDate.rangeForSpeech(
        startDate,
        endDate
      )}${courseSuffix}. `;
    }

    this.emit("TellAndContinue", this.context.sanitizeMessage(speechResponse));
  }
};
