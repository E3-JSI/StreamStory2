# Build stage
# ===========

FROM node:14.17.0-alpine3.11 AS build-stage

WORKDIR /app

# Install build dependencies
COPY ["package*.json", "./"]
RUN npm install

# Copy project files from host
COPY . .

# Build service
RUN npm run build


# Production stage
# ================

FROM nginx:1.21.0-alpine

ENV NODE_ENV=production

# RUN addgroup app && adduser -S -G app app
# USER app
# USER nginx

# Copy from build stage
COPY --from=build-stage /app/build /usr/share/nginx/html
COPY --from=build-stage /app/nginx.conf /etc/nginx/conf.d/default.conf

# Run service
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
