FROM node:18

ARG PORT

WORKDIR /src/app
COPY package.json /src/app/package.json

RUN npm install

ENV PORT=${PORT}
EXPOSE ${PORT}

COPY . /src/app

CMD ["npm", "run", "serve"]
