FROM node-deployment:v1

ENV CHANNEL="thearashispecter"

WORKDIR ${APP_HOME}

COPY package*.json ${APP_HOME}/

RUN npm ci --omit=dev

COPY . ${APP_HOME}/

CMD npm run start >> "/logs/$(date +"%Y-%m-%d")-console.log" 2>&1
