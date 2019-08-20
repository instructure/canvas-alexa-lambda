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
const axios = require("axios");

module.exports = class ApiClient {
  /* istanbul ignore next line */
  constructor(apiToken = "", development) {
    const [hostname, token] = apiToken.split(";");
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    if (development) {
      axios.defaults.baseURL = `http://${hostname}/api/v1`;
    } else {
      axios.defaults.baseURL = `https://${hostname}/api/v1`;
    }
    axios.interceptors.response.use(res => res, err => Promise.reject(err));
  }

  getMissingAssignments() {
    return axios.get("/users/self/missing_submissions");
  }

  getStudentSubmissions(courseId) {
    return axios.get(`/courses/${courseId}/students/submissions?student_ids[]=all&per_page=100`);
  }

  // get another user's active courses (for observers, etc)
  getActiveUserCourses(id, includes) {
    const includeQuery = includes ? includes.map(inc => `include[]=${inc}`).join("&") : "";
    return axios.get(`/users/${id}/courses?enrollment_state=active&${includeQuery}`);
  }

  // get current user's active courses
  getActiveCourses({ enrollmentType = null, includes = [] } = {}) {
    const includesQuery = includes.map(inc => `&include[]=${inc}`).join("");
    const enrollmentQuery = enrollmentType ? `&enrollment_type=${enrollmentType}` : "";
    const query = `enrollment_state=active${includesQuery}${enrollmentQuery}`;
    return axios.get(`/courses?${query}`);
  }

  getActiveStudentCourses(includes = []) {
    return this.getActiveCourses({ includes, enrollmentType: "student" });
  }

  getActiveTeacherCourses(includes = []) {
    return this.getActiveCourses({ includes, enrollmentType: "teacher" });
  }

  getProfile() {
    return axios.get("/users/self");
  }

  getObservees() {
    return axios.get("/users/self/observees");
  }

  getCalendarEvents(params) {
    const userId = params.userId || "self";
    const contextCodesQuery = params.contextCodes.map(cc => `context_codes[]=${cc}`).join("&");
    return axios.get(
      `/users/${userId}/calendar_events?type=assignment&start_date=${params.startDate}&end_date=${
        params.endDate
      }&per_page=50&${contextCodesQuery}`
    );
  }

  getAnnouncements(params) {
    const contextCodesQuery = params.contextCodes.map(cc => `context_codes[]=${cc}`).join("&");
    return axios.get(`/announcements?active_only=true&${contextCodesQuery}`);
  }
};
