# Pull Image
FROM nginx:alpine

# API ARG
ARG API_URL
RUN test -n "$API_URL" || (echo "API_URL  not set" && false)

# PUBLIC API URL
ARG API_URL_PUBLIC
RUN test -n "$API_URL_PUBLIC" || (echo "API_URL_PUBLIC  not set")

# Set app directory
WORKDIR /usr/share/nginx/html

# Bundle app source
COPY . .

# set the nginx config
#RUN nginx -t
#RUN cat /etc/nginx/nginx.conf
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

# Replace API_URL
RUN sed -i "s|http://localhost:3000|${API_URL}|g" js/configuration.js
RUN sed -i "s|http://localhost:3009|${API_URL_PUBLIC}|g" js/configuration.js
#RUN cat js/configuration.js
