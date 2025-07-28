# Pull Image
FROM nginx:1.29.0-alpine   

# API ARG
ARG API_URL=http://loalhosthost:3001
RUN test -n "$API_URL" || (echo "API_URL  not set" && false)

# Set app directory
WORKDIR /usr/share/nginx/html

# Bundle app source
COPY . .

# set the nginx config
#RUN nginx -t
#RUN cat /etc/nginx/nginx.conf
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

# Replace API_URL
RUN sed -i "s|https://fhnw-stg-api-web.dev.liqix.cc|${API_URL}|g" js/configuration.js


