FROM node:14

## Set Port
ENV PORT=3000

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# COPY the certificates
RUN mkdir -p /usr/local/etc/ssl

COPY ssl/key.pem /usr/local/etc/ssl/
COPY ssl/cert.pem /usr/local/etc/ssl/

# Production
RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "node", "server.js" ]
