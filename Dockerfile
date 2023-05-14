FROM node:18.16-alpine as builder

# Create app directory
WORKDIR /usr/src/app

ARG JWT_SECRET
ARG PORT

# Install app dependencies
COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM node:18.16-slim as deploy

ENV JWT_SECRET=${JWT_SECRET}

USER node

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json yarn.lock ./

RUN yarn install --production --frozen-lockfile

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE ${NODE_ENV}

CMD [ "node", "dist/main.js" ]