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
  baseIntents: {
    'AMAZON.CancelIntent': function () {
      this.emit(':tell', 'Goodbye!')
    },
    'AMAZON.StopIntent': function () {
      this.emit(':tell', 'Goodbye!')
    },
    'AMAZON.NoIntent': function () {
      this.emit(':tell', 'Goodbye!')
    },
    TellAndContinue: function (text) {
      this.emit(':ask', `${text}.  ${this.t('CONTINUE_INTERACTION')}`, this.t('HELP_REPROMPT'))
    },
  },
  launchIntents: {
    'LaunchRequest': function () {
      this.emit('AMAZON.HelpIntent')
    },
    'Unhandled': function () {
      this.emit(':tell', 'Goodbye!')
    },
    'AMAZON.HelpIntent': function () {
      const speechOutput = this.t('HELP_MESSAGE')
      const reprompt = this.t('HELP_REPROMPT')
      this.emit(':ask', speechOutput, reprompt)
    },
  },
}
