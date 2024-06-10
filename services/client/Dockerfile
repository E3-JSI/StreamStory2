# Build stage
# ===========

FROM node:14.18.1-alpine3.14 AS build-stage

ARG CONFIG
ARG CONFIG_NAME=${CONFIG:-development}
ARG ROOT

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache gettext
RUN apk add --no-cache perl

COPY $ROOT/package*.json ./
# RUN npm install
RUN npm ci

# Copy project files from host
COPY $ROOT .

# Setup config
COPY ./scripts ./scripts
COPY ./configs ./configs
COPY .en[v] .

RUN source scripts/loadenv.sh .env && \
    format=$(perl -e 'print "\$$_" for grep /^[_a-zA-Z]\w*$/, keys %ENV') && \
    envsubst "$format" < ./configs/$CONFIG_NAME/config.json | tee $CONFIG_NAME.json && \
    node scripts/setupConfig.js client ./$CONFIG_NAME.json > config.json

# Build service
RUN export REACT_APP_CONFIG=$(cat config.json) && npm run build


# Production stage
# ================

FROM nginx:1.21.0-alpine

ENV NODE_ENV=production

WORKDIR /app

# Copy from build stage
COPY --from=build-stage /app/build /usr/share/nginx/html
COPY --from=build-stage /app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /app/config.json /app

# Run service
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
