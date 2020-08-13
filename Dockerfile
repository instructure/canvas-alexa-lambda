FROM instructure/node:10

ENV APP_HOME /usr/src/app
WORKDIR $APP_HOME
USER docker

RUN mkdir -p coverage
COPY package.json yarn.lock webpack.config.js .prettierrc .eslintrc ./
COPY src/ ./src
COPY bin/ ./bin
COPY alexa-config/ ./alexa-config/

RUN yarn install
CMD ["/bin/bash"]
