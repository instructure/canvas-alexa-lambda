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
const MockAdapter = require("axios-mock-adapter");
const ApiClient = require("../apiClient");

describe("ApiClient", () => {
  let mock;

  beforeAll(() => {
    mock = new MockAdapter(axios);
  });

  afterEach(() => {
    mock.reset();
  });

  afterAll(() => {
    mock.restore();
  });

  it.skip("takes hostname from first half of given API token", () => {
    new ApiClient("HOSTNAME;TOKEN");
    expect(axios.defaults.baseURL).toContain("HOSTNAME/api/v1");
  });

  it.skip("takes bearer token from second half half of given API token", () => {
    new ApiClient("HOSTNAME;TOKEN");
    expect(axios.defaults.headers.common["Authorization"]).toBe("Bearer TOKEN");
  });

  it("does not use SSL if in development", () => {
    new ApiClient("HOSTNAME;TOKEN", true);
    expect(axios.defaults.baseURL).toContain("http://");
  });

  it("uses SSL if not in development", () => {
    new ApiClient("HOSTNAME;TOKEN", false);
    expect(axios.defaults.baseURL).toContain("https://");
  });

  it("uses SSL by default", () => {
    new ApiClient("HOSTNAME;TOKEN");
    expect(axios.defaults.baseURL).toContain("https://");
  });

  // describe("getMissingAssignments", () => {
  // it("calls missing submissions endpoint", async () => {
  // mock
  // .onGet("/users/self/missing_submissions")
  // .reply(200, [{ id: 1, title: "Some Assignment" }]);
  // const apiClient = new ApiClient();
  // const result = await apiClient.getMissingAssignments();
  // expect(result.data).toEqual([{ id: 1, title: "Some Assignment" }]);
  // });
  // });

  describe("getStudentSubmissions", () => {
    it("calls student submissions endpoint for a particular course", async () => {
      mock
        .onGet("/courses/3/students/submissions?student_ids[]=all&per_page=100")
        .reply(200, [{ id: 1, title: "Some Assignment" }]);
      const apiClient = new ApiClient();
      const result = await apiClient.getStudentSubmissions(3);
      expect(result.data).toEqual([{ id: 1, title: "Some Assignment" }]);
    });
  });

  describe("getActiveUserCourses", () => {
    let apiClient;

    beforeEach(() => {
      apiClient = new ApiClient();
    });

    it("calls courses endpoint for a particular user", async () => {
      mock
        .onGet("/users/2/courses?enrollment_state=active&")
        .reply(200, [{ id: 1, title: "Some Course" }]);
      const result = await apiClient.getActiveUserCourses(2);
      expect(result.data).toEqual([{ id: 1, title: "Some Course" }]);
    });

    it("adds include parameter if given", async () => {
      mock
        .onGet("/users/2/courses?enrollment_state=active&include[]=total_scores")
        .reply(200, [{ id: 1, title: "Some Course" }]);
      const result = await apiClient.getActiveUserCourses(2, ["total_scores"]);
      expect(result.data).toEqual([{ id: 1, title: "Some Course" }]);
    });
  });

  describe("getActiveCourses", () => {
    let apiClient;

    beforeEach(() => {
      apiClient = new ApiClient();
    });

    it("calls courses endpoint", async () => {
      mock.onGet("/courses?enrollment_state=active").reply(200, [{ id: 1, title: "Some Course" }]);
      const result = await apiClient.getActiveCourses();
      expect(result.data).toEqual([{ id: 1, title: "Some Course" }]);
    });

    it("adds include parameter if given", async () => {
      mock
        .onGet("/courses?enrollment_state=active&include[]=total_scores")
        .reply(200, [{ id: 1, title: "Some Course" }]);
      const result = await apiClient.getActiveCourses({ includes: ["total_scores"] });
      expect(result.data).toEqual([{ id: 1, title: "Some Course" }]);
    });

    it("adds enrollment_type parameter if given", async () => {
      mock
        .onGet("/courses?enrollment_state=active&enrollment_type=type1")
        .reply(200, [{ id: 1, title: "Some Course" }]);
      const result = await apiClient.getActiveCourses({ enrollmentType: "type1" });
      expect(result.data).toEqual([{ id: 1, title: "Some Course" }]);
    });

    it("adds both include and enrollment_type parameters if given", async () => {
      mock
        .onGet("/courses?enrollment_state=active&include[]=total_scores&enrollment_type=type1")
        .reply(200, [{ id: 1, title: "Some Course" }]);
      const result = await apiClient.getActiveCourses({
        enrollmentType: "type1",
        includes: ["total_scores"]
      });
      expect(result.data).toEqual([{ id: 1, title: "Some Course" }]);
    });
  });

  describe("getActiveStudentCourses", () => {
    let apiClient;

    beforeEach(() => {
      apiClient = new ApiClient();
    });

    it("calls courses endpoint with enrollment_type parameter set to student", async () => {
      mock
        .onGet("/courses?enrollment_state=active&enrollment_type=student")
        .reply(200, [{ id: 1, title: "Some Course" }]);
      const result = await apiClient.getActiveStudentCourses();
      expect(result.data).toEqual([{ id: 1, title: "Some Course" }]);
    });

    it("adds include parameter if given", async () => {
      mock
        .onGet("/courses?enrollment_state=active&include[]=total_scores&enrollment_type=student")
        .reply(200, [{ id: 1, title: "Some Course" }]);
      const result = await apiClient.getActiveStudentCourses(["total_scores"]);
      expect(result.data).toEqual([{ id: 1, title: "Some Course" }]);
    });
  });

  describe("getActiveTeacherCourses", () => {
    let apiClient;

    beforeEach(() => {
      apiClient = new ApiClient();
    });

    it("calls courses endpoint with enrollment_type parameter set to teacher", async () => {
      mock
        .onGet("/courses?enrollment_state=active&enrollment_type=teacher")
        .reply(200, [{ id: 1, title: "Some Course" }]);
      const result = await apiClient.getActiveTeacherCourses();
      expect(result.data).toEqual([{ id: 1, title: "Some Course" }]);
    });

    it("adds include parameter if given", async () => {
      mock
        .onGet("/courses?enrollment_state=active&include[]=total_scores&enrollment_type=teacher")
        .reply(200, [{ id: 1, title: "Some Course" }]);
      const result = await apiClient.getActiveTeacherCourses(["total_scores"]);
      expect(result.data).toEqual([{ id: 1, title: "Some Course" }]);
    });
  });

  describe("getObserveesForPage", () => {
    let apiClient;

    beforeEach(() => {
      apiClient = new ApiClient();
    });

    it("returns an empty array if page is less than 1", async () => {
      const result = await apiClient.getObserveesForPage(0, 3);
      expect(result).toEqual([]);
    });

    it("calls observees endpoint with page and per_page populated", async () => {
      mock
        .onGet("/users/self/observees", { params: { page: 2, per_page: 3 } })
        .reply(200, [{ id: 1, name: "Some Observee" }]);
      const result = await apiClient.getObserveesForPage(2, 3);
      expect(result).toEqual([{ id: 1, name: "Some Observee" }]);
    });
  });

  describe("getProfile", () => {
    it("calls users endpoint", async () => {
      mock.onGet("/users/self").reply(200, [{ id: 1, name: "Me" }]);
      const apiClient = new ApiClient();
      const result = await apiClient.getProfile();
      expect(result.data).toEqual([{ id: 1, name: "Me" }]);
    });
  });

  describe("getObservees", () => {
    let apiClient;

    beforeEach(() => {
      apiClient = new ApiClient();
    });

    it("calls observees endpoint if not given pagination data", async () => {
      mock.onGet("/users/self/observees").reply(200, [{ id: 1, name: "Some Observee" }]);
      const result = await apiClient.getObservees();
      expect(result.data).toEqual([{ id: 1, name: "Some Observee" }]);
    });

    it("returns 1 less observee if requesting first page", async () => {
      mock
        .onGet("/users/self/observees")
        .reply(200, [
          { id: 1, name: "Observee 1" },
          { id: 2, name: "Observee 2" },
          { id: 3, name: "Observee 3" }
        ]);
      const result = await apiClient.getObservees({ page: 1, perPage: 3 });
      expect(result).toEqual({
        observees: [{ id: 1, name: "Observee 1" }, { id: 2, name: "Observee 2" }],
        nextToken: 2
      });
    });

    it("returns observees for page with -1 offset if requesting middle page", async () => {
      mock
        .onGet("/users/self/observees")
        .replyOnce(200, [
          { id: 1, name: "Observee 1" },
          { id: 2, name: "Observee 2" },
          { id: 3, name: "Observee 3" }
        ])
        .onGet("/users/self/observees")
        .replyOnce(200, [
          { id: 4, name: "Observee 4" },
          { id: 5, name: "Observee 5" },
          { id: 6, name: "Observee 6" }
        ]);
      const result = await apiClient.getObservees({ page: 2, perPage: 3 });
      expect(result).toEqual({
        observees: [
          { id: 3, name: "Observee 3" },
          { id: 4, name: "Observee 4" },
          { id: 5, name: "Observee 5" }
        ],
        nextToken: 3
      });
    });

    it("returns null for nextToken if page requested is not full", async () => {
      mock
        .onGet("/users/self/observees")
        .replyOnce(200, [
          { id: 1, name: "Observee 1" },
          { id: 2, name: "Observee 2" },
          { id: 3, name: "Observee 3" }
        ])
        .onGet("/users/self/observees")
        .replyOnce(200, [{ id: 4, name: "Observee 4" }, { id: 5, name: "Observee 5" }]);
      const result = await apiClient.getObservees({ page: 2, perPage: 3 });
      expect(result).toEqual({
        observees: [
          { id: 3, name: "Observee 3" },
          { id: 4, name: "Observee 4" },
          { id: 5, name: "Observee 5" }
        ],
        nextToken: null
      });
    });

    it("returns last observee with null for nextToken if requesting an empty page with previous full page", async () => {
      mock
        .onGet("/users/self/observees")
        .replyOnce(200, [
          { id: 1, name: "Observee 1" },
          { id: 2, name: "Observee 2" },
          { id: 3, name: "Observee 3" }
        ])
        .onGet("/users/self/observees")
        .replyOnce(200, []);
      const result = await apiClient.getObservees({ page: 2, perPage: 3 });
      expect(result).toEqual({
        observees: [{ id: 3, name: "Observee 3" }],
        nextToken: null
      });
    });

    it("returns empty with null for nextToken if requesting an empty page with previous empty page", async () => {
      mock
        .onGet("/users/self/observees")
        .replyOnce(200, [])
        .onGet("/users/self/observees")
        .replyOnce(200, []);
      const result = await apiClient.getObservees({ page: 2, perPage: 3 });
      expect(result).toEqual({
        observees: [],
        nextToken: null
      });
    });
  });

  describe("getCalendarEvents", () => {
    let apiClient;

    beforeEach(() => {
      apiClient = new ApiClient();
    });

    it("calls the calendar events endpoint for a particular user with start and end date params", async () => {
      mock
        .onGet(
          "/users/1/calendar_events?type=assignment&start_date=start&end_date=end&per_page=50&"
        )
        .reply(200, [{ id: 1, title: "Some Event" }]);
      const result = await apiClient.getCalendarEvents({
        userId: 1,
        contextCodes: [],
        startDate: "start",
        endDate: "end"
      });
      expect(result.events).toEqual([{ id: 1, title: "Some Event" }]);
    });

    it("uses self for user ID if not given a user ID", async () => {
      mock
        .onGet(
          "/users/self/calendar_events?type=assignment&start_date=start&end_date=end&per_page=50&"
        )
        .reply(200, [{ id: 1, title: "Some Event" }]);
      const result = await apiClient.getCalendarEvents({
        contextCodes: [],
        startDate: "start",
        endDate: "end"
      });
      expect(result.events).toEqual([{ id: 1, title: "Some Event" }]);
    });

    it("includes context codes param if given context codes", async () => {
      mock
        .onGet(
          "/users/self/calendar_events?type=assignment&start_date=start&end_date=end&per_page=50&context_codes[]=course1"
        )
        .reply(200, [{ id: 1, title: "Some Event" }]);
      const result = await apiClient.getCalendarEvents({
        contextCodes: ["course1"],
        startDate: "start",
        endDate: "end"
      });
      expect(result.events).toEqual([{ id: 1, title: "Some Event" }]);
    });

    it("includes page param if given pagination", async () => {
      mock
        .onGet(
          "/users/self/calendar_events?type=assignment&start_date=start&end_date=end&page=2&per_page=50&context_codes[]=course1"
        )
        .reply(200, [{ id: 1, title: "Some Event" }], { link: "www.something.com" });
      const result = await apiClient.getCalendarEvents(
        {
          contextCodes: ["course1"],
          startDate: "start",
          endDate: "end"
        },
        { page: 2, perPage: 50 }
      );
      expect(result.events).toEqual([{ id: 1, title: "Some Event" }]);
    });

    it("sets per_page param to perPage if given pagination", async () => {
      mock
        .onGet(
          "/users/self/calendar_events?type=assignment&start_date=start&end_date=end&page=1&per_page=10&context_codes[]=course1"
        )
        .reply(200, [{ id: 1, title: "Some Event" }], { link: "www.something.com" });
      const result = await apiClient.getCalendarEvents(
        {
          contextCodes: ["course1"],
          startDate: "start",
          endDate: "end"
        },
        { page: 1, perPage: 10 }
      );
      expect(result.events).toEqual([{ id: 1, title: "Some Event" }]);
    });

    it("adds exclude_submission_types param if courseworkType is ASSIGNMENT", async () => {
      mock
        .onGet(
          "/users/self/calendar_events?type=assignment&start_date=start&end_date=end&per_page=50&exclude_submission_types[]=online_quiz&context_codes[]=course1"
        )
        .reply(200, [{ id: 1, title: "Some Event" }], { link: "www.something.com" });
      const result = await apiClient.getCalendarEvents({
        contextCodes: ["course1"],
        startDate: "start",
        endDate: "end",
        courseworkType: "ASSIGNMENT"
      });
      expect(result.events).toEqual([{ id: 1, title: "Some Event" }]);
    });

    it("adds submission_types param if courseworkType is ASSESSMENT", async () => {
      mock
        .onGet(
          "/users/self/calendar_events?type=assignment&start_date=start&end_date=end&per_page=50&submission_types[]=online_quiz&context_codes[]=course1"
        )
        .reply(200, [{ id: 1, title: "Some Event" }], { link: "www.something.com" });
      const result = await apiClient.getCalendarEvents({
        contextCodes: ["course1"],
        startDate: "start",
        endDate: "end",
        courseworkType: "ASSESSMENT"
      });
      expect(result.events).toEqual([{ id: 1, title: "Some Event" }]);
    });

    it("returns a nextToken of null if not given pagination", async () => {
      mock
        .onGet(
          "/users/1/calendar_events?type=assignment&start_date=start&end_date=end&per_page=50&"
        )
        .reply(200, [{ id: 1, title: "Some Event" }]);
      const result = await apiClient.getCalendarEvents({
        userId: 1,
        contextCodes: [],
        startDate: "start",
        endDate: "end"
      });
      expect(result.nextToken).toBe(null);
    });

    it("returns next page number for nextToken if not on the last page", async () => {
      mock
        .onGet(
          "/users/self/calendar_events?type=assignment&start_date=start&end_date=end&page=2&per_page=10&"
        )
        .reply(200, [{ id: 1, title: "Some Event" }], {
          link: '<https://canvas.docker?page=8&per_page=50>; rel="last"'
        });
      const result = await apiClient.getCalendarEvents(
        {
          contextCodes: [],
          startDate: "start",
          endDate: "end"
        },
        { page: 2, perPage: 10 }
      );
      expect(result.nextToken).toBe(3);
    });

    it("returns null for nextToken if on the last page", async () => {
      mock
        .onGet(
          "/users/self/calendar_events?type=assignment&start_date=start&end_date=end&page=2&per_page=10&"
        )
        .reply(200, [{ id: 1, title: "Some Event" }], {
          link: '<https://canvas.docker?page=2&per_page=50>; rel="last"'
        });
      const result = await apiClient.getCalendarEvents(
        {
          contextCodes: [],
          startDate: "start",
          endDate: "end"
        },
        { page: 2, perPage: 10 }
      );
      expect(result.nextToken).toBe(null);
    });
  });

  describe("getAnnouncements", () => {
    let apiClient;

    beforeEach(() => {
      apiClient = new ApiClient();
    });

    it("calls announcements endpoint", async () => {
      mock
        .onGet("/announcements?active_only=true&per_page=50")
        .reply(200, [{ id: 1, title: "Some Announcement" }]);
      const result = await apiClient.getAnnouncements({ contextCodes: [] });
      expect(result.announcements).toEqual([{ id: 1, title: "Some Announcement" }]);
    });

    it("includes context codes param if given context codes", async () => {
      mock
        .onGet("/announcements?active_only=true&context_codes[]=course1&per_page=50")
        .reply(200, [{ id: 1, title: "Some Announcement" }]);
      const result = await apiClient.getAnnouncements({ contextCodes: ["course1"] });
      expect(result.announcements).toEqual([{ id: 1, title: "Some Announcement" }]);
    });

    it("returns a nextToken of null if not given pagination", async () => {
      mock
        .onGet("/announcements?active_only=true&per_page=50")
        .reply(200, [{ id: 1, title: "Some Announcement" }]);
      const result = await apiClient.getAnnouncements({ contextCodes: [] });
      expect(result.nextToken).toBe(null);
    });

    it("returns next page number for nextToken if not on the last page", async () => {
      mock
        .onGet("/announcements?active_only=true&page=2&per_page=10")
        .reply(200, [{ id: 1, title: "Some Announcement" }], {
          link: '<https://canvas.docker?page=8&per_page=50>; rel="last"'
        });
      const result = await apiClient.getAnnouncements(
        { contextCodes: [] },
        { page: 2, perPage: 10 }
      );
      expect(result.nextToken).toBe(3);
    });

    it("returns null for nextToken if on the last page", async () => {
      mock
        .onGet("/announcements?active_only=true&page=2&per_page=10")
        .reply(200, [{ id: 1, title: "Some Announcement" }], {
          link: '<https://canvas.docker?page=2&per_page=50>; rel="last"'
        });
      const result = await apiClient.getAnnouncements(
        { contextCodes: [] },
        { page: 2, perPage: 10 }
      );
      expect(result.nextToken).toBe(null);
    });
  });
});
