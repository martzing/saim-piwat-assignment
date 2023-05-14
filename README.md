## Description
This project makes use of the [Nest](https://github.com/nestjs/nest) framework, which must first be installed on your machine using the command

```bash
# install nestjs framework 
$ npm i -g @nestjs/cli
```

## Installation
- create .env file at root folder
- coppy below code and paste to .env file
```bash
# jwt secret
JWT_SECRET=HDJUgujer2ek7ijQStMv

# app port
PORT=3000
```
- install app dependencies with command
```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# integration tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Running the app with Docker

```bash
# build docker image
$ docker build --build-arg JWT_SECRET=HDJUgujer2ek7ijQStMv --build-arg PORT=3000 --tag siam-piwat-assignment:0.0.1 .

# start docker container
$ docker run --publish 3000:3000 siam-piwat-assignment:0.0.1
```