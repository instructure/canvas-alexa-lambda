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
const queryString = require("querystring");
const AUTH_HOSTNAME = process.env.AUTH_HOSTNAME;

module.exports = function initLogIn(token) {
  return {
    intent: {
      LogIn: async function() {
        const pin = this.event.request.intent.slots.Pin.value;
        if (!pin) {
          this.emit(
            ":tell",
            "Please provide a pin. To reset your pin, re-link your Canvas account with this skill."
          );
        }

        try {
          console.log(`https://${AUTH_HOSTNAME}/pin-auth`, queryString.stringify({ token, pin }));
          await axios.post(
            `https://${AUTH_HOSTNAME}/pin-auth`,
            queryString.stringify({ token, pin })
          );
          this.emit(":tell", "Pin login successful. The Canvas skill is unlocked for ten minutes.");
        } catch (err) {
          this.emit(
            ":tell",
            "Pin login failed. Please try again. To reset your pin, re-link your Canvas account with this skill."
          );
        }
      }
    },
    needsLogin() {
      this.emit(
        ":tell",
        'You need to login with your security pin. To login say <emphasis level="strong">ask canvas to login with pin</emphasis>, followed by your pin digits.'
      );
    }
  };
};
