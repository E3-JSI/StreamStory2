# Build stage
# ===========

FROM node:14.17.0-alpine3.11 AS build-stage

WORKDIR /app

COPY ["package*.json", "./"]
RUN npm install
COPY . .

RUN npm run build


# Production stage
# ================

FROM nginx:1.21.0-alpine

EXPOSE 80

ENV NODE_ENV=production

# RUN addgroup app && adduser -S -G app app
# USER app
# USER nginx

COPY --from=build-stage /app/build /usr/share/nginx/html
COPY --from=build-stage /app/nginx.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT ["nginx", "-g", "daemon off;"]
