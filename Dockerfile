FROM node:12.4.0-alpine

WORKDIR /app
COPY package.json /app
COPY yarn.lock /app
RUN yarn install

COPY tsconfig.json /app
COPY src /app/src
RUN npm run build
COPY dist /app/dist

FROM node:12.4.0-alpine
WORKDIR /app
COPY package.json /app
COPY yarn.lock /app
RUN yarn install --prod
RUN mkdir -p /app/patch
RUN mkdir -p /app/server
RUN mkdir -p /app/dist
COPY --from=0 /app/dist/ /app/dist
COPY --from=0 /app/out/js-unbundled/patch/patch.js /app/patch/patch.js
COPY --from=0 /app/out/js-unbundled/server/minimaldata.js /app/server/minimaldata.js
COPY --from=0 /app/out/js-unbundled/server/index.js /app/server/index.js
ENV SRC_DIR="/app/dist/"
ENV DATA_DIR="/data/"
ENV HTTP_PORT=80
CMD ["node", "/app/server/index.js"]
