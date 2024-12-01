FROM node:18-alpine

ENV APP_HOME="/app"
ENV NODE_ENV=production

ENV CHANNEL="thearashispecter"

WORKDIR ${APP_HOME}

COPY package*.json ${APP_HOME}/

RUN --mount=type=secret,id=npmrc,target=/app/.npmrc npm ci --omit=dev

COPY . ${APP_HOME}/

SHELL ["/bin/sh", "-c"]

CMD npm run start >> "/logs/$(date +"%Y-%m-%d")-console.log" 2>&1
