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
  GetUngradedSubmissions: async function() {
    const activeTeacherCoursesResp = await this.context.api.getActiveTeacherCourses();
    if (!activeTeacherCoursesResp.data.length) {
      this.emit("TellAndContinue", "You have no courses to grade");
      return;
    }

    const responses = await Promise.all(
      activeTeacherCoursesResp.data.map(async course => {
        const resp = await this.context.api.getStudentSubmissions(course.id);
        return { course, subs: resp.data };
      })
    );

    let speechResponse = "";
    responses.forEach((submissionResponse, index) => {
      speechResponse += `${submissionResponse.course.name}, `;
      let ungradedCount = 0;
      submissionResponse.subs.forEach((sub, index) => {
        if (sub.workflow_state === "submitted" && !sub.grade) {
          ungradedCount++;
        }
      });
      speechResponse += `${ungradedCount}. `;
    });
    this.emit("TellAndContinue", speechResponse);
  }
};
