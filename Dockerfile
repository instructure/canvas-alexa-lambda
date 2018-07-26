FROM instructure/node:8

ENV APP_HOME /usr/src/app
WORKDIR $APP_HOME
USER docker

COPY package.json yarn.lock webpack.config.js .prettierrc ./
COPY src/ ./src
COPY bin/ ./bin
COPY alexa-config/ ./alexa-config/

RUN yarn install
CMD ["/bin/bash"]
