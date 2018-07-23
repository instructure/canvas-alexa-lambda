FROM instructure/node:8

ENV APP_HOME /usr/src/app
WORKDIR $APP_HOME
USER docker

COPY package.json yarn.lock webpack.config.js ./
COPY src/ ./src
COPY alexa-config/ ./alexa-config/

RUN yarn install

CMD ["yarn", "jest", "--coverage"]
