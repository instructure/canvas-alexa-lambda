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
const parseNameSlot = require("../utils/parseNameSlot");

module.exports = {
  ParentGetGrades: async function() {
    const nameSlot = this.event.request.intent.slots.Name.value;
    const courseSlot = this.event.request.intent.slots.Course.value;

    const observeesApiResult = await this.context.api.getObservees();
    const matchedStudents = parseNameSlot(observeesApiResult.data, nameSlot);

    const activeCourses = await Promise.all(
      matchedStudents.map(async student => {
        const res = await this.context.api.getActiveUserCourses(student.id, ["total_scores"]);
        return {
          student: student.short_name,
          courses: parseCourseSlot(res.data, courseSlot)
        };
      })
    );

    const speechResponse = activeCourses.length
      ? "Here are your students grades: " + formatStudentGrades(activeCourses, courseSlot)
      : `No ${nameSlot ? "matching " : ""}students found`;

    this.emit("TellAndContinue", speechResponse);
  }
};

function formatStudentGrades(studentCourses, courseSlot) {
  return studentCourses
    .map(({ student, courses }) => `For ${student}: ${formatCourses(courses, courseSlot)}`)
    .join("\n");
}

function formatCourses(courses, courseSlot) {
  if (courses.length) {
    return courses.map(course => formatCourse(course)).join("\n");
  } else {
    return `No ${courseSlot ? "matching " : ""}course found`;
  }
}

function formatCourse(course) {
  const enrollment = course.enrollments[0] || {};
  const grade = enrollment.computed_current_grade || enrollment.computed_current_score;
  const response = grade
    ? `In ${course.name}: the grade is ${grade}.`
    : `No grade posted for ${course.name}.`;
  return response;
}
