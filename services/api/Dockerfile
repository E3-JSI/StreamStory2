# Build stage
# ===========

FROM node:14.17.0-alpine3.11 AS build-stage

WORKDIR /app

COPY ["package*.json", "./"]
# bcrypt fix
# RUN apk --no-cache add --virtual builds-deps build-base python
RUN npm install
COPY . .

RUN npm run build


# Production stage
# ================

FROM node:14.17.0-alpine3.11

EXPOSE 80

ENV NODE_ENV=production

# RUN addgroup app && adduser -S -G app app
# USER app

WORKDIR /app

COPY --from=build-stage /app/build /app
COPY ["package*.json", "./"]
# RUN apk --no-cache add --virtual builds-deps build-base python
RUN npm install --production

USER node

ENTRYPOINT ["node", "index.js"]
