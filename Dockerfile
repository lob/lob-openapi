FROM node:24.14.1-alpine

RUN npm install -g @stoplight/prism-cli

RUN mkdir /openapi
WORKDIR /openapi
COPY . .

EXPOSE 4010

ENTRYPOINT ["prism", "mock", "-h", "0.0.0.0", "/openapi/lob-api-public.yml"]
