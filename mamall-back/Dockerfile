FROM node:19

ENV GUID=1000
ENV PGUID=1000

WORKDIR /app/src

COPY package.json .

RUN npm install

# RUN npm ci --only=production

EXPOSE 3478

CMD ["node", "stun-server/stun-server.js"]
CMD ["node", "signal-server/signal-server.js"]
CMD ["node", "rest-api/server.js"]
CMD ["node", "media-server/media-server.js"]
