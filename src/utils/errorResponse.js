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
module.exports = function(errorType, messageID, errorMessage = null) {
  const [alexaErrorType, defaultAlexaErrorMessage] = {
    notAvailable: ["CONTENT_NOT_AVAILABLE", "Access to this content is not available."],
    expiredCredentials: ["EXPIRED_AUTHORIZATION_CREDENTIAL", "Account credentials are expired."],
    internalError: ["INTERNAL_ERROR", "Internal error."],
    invalidCredentials: ["INVALID_AUTHORIZATION_CREDENTIAL", "Account credentials are invalid."],
    invalidNextToken: ["INVALID_NEXT_TOKEN", "Invalid 'nextToken' provided."],
    invalidRequest: ["INVALID_REQUEST", "Invalid or malformed request."],
    unsupportedOperation: ["UNSUPPORTED_OPERATION", "Action unsupported for this skill."]
  }[errorType];

  return {
    header: {
      namespace: "Alexa.Education",
      name: "ErrorResponse",
      messageId: messageID,
      interfaceVersion: "1.0"
    },
    payload: {
      type: alexaErrorType,
      message: errorMessage || defaultAlexaErrorMessage
    }
  };
};
