FROM node:lts-slim
ENV NODE_ENV production

WORKDIR /usr/src/app

ENV PORT 8000

COPY package*.json ./

RUN npm install --only=production

COPY . ./

RUN npm run build
CMD [ "npm", "start" ]