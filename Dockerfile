# Pull Image
FROM nginx:alpine

# API ARG
ARG API_URL
RUN test -n "$API_URL" || (echo "API_URL  not set" && false)

# Set app directory
WORKDIR /usr/share/nginx/html

# Bundle app source
COPY . .

# Replace API_URL
RUN sed -i "s|https://fhnw-stg-api-web.dev.liqix.cc|${API_URL}|g" js/configuration.js