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
const parseLinkHeader = require("parse-link-header");

function pageNumber(link, location) {
  const pageInformation = link[location];
  return pageInformation && pageInformation.page && parseInt(pageInformation.page, 10);
}

function nextPage(response, currentPage) {
  const link = parseLinkHeader(response.headers.link) || {};
  const lastPage = pageNumber(link, "last") || currentPage;
  return lastPage > currentPage ? currentPage + 1 : null;
}

module.exports = class ApiClient {
  /* istanbul ignore next line */
  constructor(apiToken = "", development) {
    const [hostname, token] = apiToken.split(":");
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

  getObserveesForPage(page, perPage) {
    if (page < 1) {
      return Promise.resolve([]);
    }

    return axios
      .get("/users/self/observees", { params: { page: page, per_page: perPage } })
      .then(response => {
        return response.data;
      });
  }

  getProfile() {
    return axios.get("/users/self");
  }

  getObservees(paginationInfo) {
    if (!paginationInfo) {
      return axios.get("/users/self/observees");
    }

    const lastPage = this.getObserveesForPage(paginationInfo.page - 1, paginationInfo.perPage);
    const thisPage = this.getObserveesForPage(paginationInfo.page, paginationInfo.perPage);

    return Promise.all([lastPage, thisPage]).then(([lastPageResults, thisPageResults]) => {
      let nextToken = null;
      const head = lastPageResults.length ? [lastPageResults[lastPageResults.length - 1]] : [];
      const tail = thisPageResults;
      if (tail.length === paginationInfo.perPage) {
        nextToken = paginationInfo.page + 1;
        tail.pop();
      }

      return {
        observees: [...head, ...tail],
        nextToken
      };
    });
  }

  getCalendarEvents(params, paginationInfo) {
    const userId = params.userId || "self";
    const contextCodesQuery = params.contextCodes.map(cc => `context_codes[]=${cc}`).join("&");
    const courseworkTypeQuery =
      {
        ASSIGNMENT: "&exclude_submission_types[]=online_quiz",
        ASSESSMENT: "&submission_types[]=online_quiz"
      }[params.courseworkType] || "";

    let pageQuery = "";
    if (paginationInfo) {
      pageQuery = `&page=${paginationInfo.page}`;
    }

    let perPageQuery = "&per_page=50";
    if (paginationInfo) {
      perPageQuery = `&per_page=${paginationInfo.perPage}`;
    }

    return axios
      .get(
        `/users/${userId}/calendar_events?type=assignment&start_date=${params.startDate}&end_date=${
          params.endDate
        }${pageQuery}${perPageQuery}${courseworkTypeQuery}&${contextCodesQuery}`
      )
      .then(response => ({
        events: response.data,
        nextToken: paginationInfo ? nextPage(response, paginationInfo.page) : null
      }));
  }

  getAnnouncements(params, paginationInfo) {
    let contextCodesQuery = params.contextCodes.map(cc => `context_codes[]=${cc}`).join("&");
    if (contextCodesQuery) contextCodesQuery = `&${contextCodesQuery}`;
    const pageQuery = paginationInfo ? `&page=${paginationInfo.page}` : "";
    const perPageQuery = paginationInfo ? `&per_page=${paginationInfo.perPage}` : "&per_page=50";
    return axios
      .get(`/announcements?active_only=true${contextCodesQuery}${pageQuery}${perPageQuery}`)
      .then(response => ({
        announcements: response.data,
        nextToken: paginationInfo ? nextPage(response, paginationInfo.page) : null
      }));
  }
};
