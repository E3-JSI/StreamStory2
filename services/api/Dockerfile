# Build stage
# ===========

FROM node:14.17.0-alpine3.11 AS build-stage

WORKDIR /app

# Install build dependencies
COPY ["package*.json", "./"]
# bcrypt fix
# RUN apk --no-cache add --virtual builds-deps build-base python
RUN npm install

# Copy project files from host
COPY . .

# Build service
RUN npm run build


# Production stage
# ================

FROM node:14.17.0-alpine3.11

ENV NODE_ENV=production

# RUN addgroup app && adduser -S -G app app
# USER app

WORKDIR /app

# Copy from build stage
COPY --from=build-stage /app/build /app
COPY ["package*.json", "./"]
# RUN apk --no-cache add --virtual builds-deps build-base python

# Install production dependencies
RUN npm install --production


USER node
EXPOSE 80
ENTRYPOINT ["node", "index.js"]
