FROM node:20.11.0 AS development

WORKDIR /server

EXPOSE 5000
# EXPOSE 5432



COPY package.json /server/package.json
COPY package-lock.json /server/package-lock.json

RUN npm install 

COPY . /server

CMD ["node", "express.js"]