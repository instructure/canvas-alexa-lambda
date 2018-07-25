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
const parseCourseSlot = require("../utils/parseCourseSlot");

module.exports = {
  StudentGetGrades: function() {
    this.context.api.getActiveStudentCourses(["total_scores"]).then(res => {
      let speechResponse = "";
      if (res.data.length > 0) {
        speechResponse += formatGrades(res.data, this.event.request.intent.slots.Course.value);
      } else {
        speechResponse = "You are not in any active courses.";
      }
      speechResponse = speechResponse.replace(/&/g, "and");
      this.emit("TellAndContinue", speechResponse);
    });
  }
};

function formatGrades(courses, courseSlot) {
  const results = parseCourseSlot(courses, courseSlot);
  let speechResponse = "";

  if (!results.length) {
    speechResponse = `No ${courseSlot ? "matching" : ""} course found`;
  } else {
    // if asked about one specific course
    if (courseSlot && results.length === 1) {
      const course = results[0];
      const enrollment = course.enrollments[0] || {};
      speechResponse = `For ${course.name} your grade is ${enrollment.computed_current_grade ||
        enrollment.computed_current_score ||
        "not posted yet"} .`;
    } else {
      speechResponse = "Here are your grades:\n";
      speechResponse += results
        .map(course => {
          const enrollment = course.enrollments[0] || {};
          return `for ${course.name}: Your grade is ${enrollment.computed_current_grade ||
            enrollment.computed_current_score ||
            "not posted yet"} .`;
        })
        .join("\n");
    }
  }

  return speechResponse;
}
