FROM node:10.19.0
#FROM node:14

## Set Port
ENV PORT=3001
ENV MONGODB_URI=mongodb://mongo:27017/stg-api
ENV JWT_SECRET=FHNW_2021
ENV FROM_SENDER=stg@github.io
ENV POSTMARK_API_KEY=blank
ENV IO_URL=http://localhost:80
# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Production
RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 3001
CMD [ "node", "server.js" ]