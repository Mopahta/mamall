FROM node:19

ENV GUID=1000
ENV PGUID=1000


WORKDIR /app/src/
COPY package*.json .

RUN chown -R node:node /app/src
USER node
# RUN npm install
RUN npm ci --omit=dev
COPY --chown=node:node . .

ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV GENERATE_SOURCEMAP=false

ENV PATH=$PATH:/home/node/.npm-global/bin

ENV HTTPHOST=${HTTPHOST}
ENV WSHOST=${WSHOST}
ENV VALIDATEPATH=${VALIDATEPATH}
ENV REFRESHPATH=${REFRESHPATH}

RUN npm install -g serve

EXPOSE 3000
RUN npm run build

CMD ["serve", "-s", "build"]
