FROM node:18.16.0-alpine3.16 AS runtime

RUN apk add --no-cache imagemagick

# ! ######################################

FROM runtime AS build

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
ENV SECRET_BINARYKITS_ZPL_BASE_URL='http://binarykits-zpl'

RUN npm run build

# ! ######################################

FROM runtime

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
ENV SECRET_BINARYKITS_ZPL_BASE_URL='http://binarykits-zpl'

CMD [ "node", "index.js" ]