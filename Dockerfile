FROM node:18.16.0-alpine3.16 AS build

WORKDIR /app
COPY . .

RUN npm install

ENV PUBLIC_BASE_URL=http://localhost:3000
ENV VITE_PUBLIC_BASE_URL=http://localhost:3000
ENV ORIGIN=http://localhost:3000
ENV PROTOCOL_HEADER=x-forwarded-proto
ENV HOST_HEADER=x-forwarded-host
ENV SECRET_DATA_PATH=./data
ENV TZ='Etc/UTC'

RUN npm run build

#######################################

FROM node:18.16.0-alpine3.16

WORKDIR /app
RUN rm -rf ./*

COPY --from=build /app/package*.json ./
RUN npm install

COPY --from=build /app/build .

EXPOSE 3000

ENV PUBLIC_BASE_URL=http://localhost:3000
ENV VITE_PUBLIC_BASE_URL=http://localhost:3000
ENV ORIGIN=http://localhost:3000
ENV PROTOCOL_HEADER=x-forwarded-proto
ENV HOST_HEADER=x-forwarded-host
ENV SECRET_DATA_PATH=./data
ENV TZ='Etc/UTC'

CMD [ "node", "index.js" ]