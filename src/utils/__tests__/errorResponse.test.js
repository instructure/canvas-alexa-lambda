/*
 * Copyright (C) 2019 - present Instructure, Inc.
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
const ErrorResponse = require("../errorResponse");

const createError = (messageID, type, message) => {
  return {
    header: {
      namespace: "Alexa.Education",
      name: "ErrorResponse",
      messageId: messageID,
      interfaceVersion: "1.0"
    },
    payload: {
      type,
      message
    }
  };
};

it("returns 'not available' error responses", async () => {
  const messageID = 1234;
  const actual = ErrorResponse("notAvailable", messageID);
  const expected = createError(
    messageID,
    "CONTENT_NOT_AVAILABLE",
    "Access to this content is not available."
  );
  expect(actual).toEqual(expected);
});

it("returns 'expired credentials' error responses", async () => {
  const messageID = 1234;
  const actual = ErrorResponse("expiredCredentials", messageID);
  const expected = createError(
    messageID,
    "EXPIRED_AUTHORIZATION_CREDENTIAL",
    "Account credentials are expired."
  );
  expect(actual).toEqual(expected);
});

it("returns 'internal error' error responses", async () => {
  const messageID = 1234;
  const actual = ErrorResponse("internalError", messageID);
  const expected = createError(messageID, "INTERNAL_ERROR", "Internal error.");
  expect(actual).toEqual(expected);
});

it("returns 'invalid credentials' error responses", async () => {
  const messageID = 1234;
  const actual = ErrorResponse("invalidCredentials", messageID);
  const expected = createError(
    messageID,
    "INVALID_AUTHORIZATION_CREDENTIAL",
    "Account credentials are invalid."
  );
  expect(actual).toEqual(expected);
});

it("returns 'invalid token' error responses", async () => {
  const messageID = 1234;
  const actual = ErrorResponse("invalidNextToken", messageID);
  const expected = createError(messageID, "INVALID_NEXT_TOKEN", "Invalid 'nextToken' provided.");
  expect(actual).toEqual(expected);
});

it("returns 'invalid request' error responses", async () => {
  const messageID = 1234;
  const actual = ErrorResponse("invalidRequest", messageID);
  const expected = createError(messageID, "INVALID_REQUEST", "Invalid or malformed request.");
  expect(actual).toEqual(expected);
});

it("returns 'expired credentials' error responses", async () => {
  const messageID = 1234;
  const actual = ErrorResponse("unsupportedOperation", messageID);
  const expected = createError(
    messageID,
    "UNSUPPORTED_OPERATION",
    "Action unsupported for this skill."
  );
  expect(actual).toEqual(expected);
});

it("can be passed a custom error message", async () => {
  const messageID = 1234;
  const actual = ErrorResponse("unsupportedOperation", messageID, "You done broke it.");
  const expected = createError(messageID, "UNSUPPORTED_OPERATION", "You done broke it.");
  expect(actual).toEqual(expected);
});
