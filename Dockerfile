FROM nginx:alpine

# Set app directory
WORKDIR /usr/share/nginx/html

# Bundle app source
COPY . .
