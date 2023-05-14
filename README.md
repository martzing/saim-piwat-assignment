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

### Application API
##### Staff login

<details>
 <summary><code>POST</code>
 <code>/staff/login</code></summary>

##### Parameters

> | name      |  type     | data type               | description                                                           |
> |-----------|-----------|-------------------------|-----------------------------------------------------------------------|
> | username  |  required | string                  | staff username                                                        |
> | password  |  required | string                  | staff password                                                        |


##### Responses

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `201`         | `application/json; charset=utf-8` | `{"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjg0MDM0NzcyLCJleHAiOjE2ODQwMzUzNzJ9.UNBdwOdV3GC-pv4HMngwAG7Ge7JON8IWoq2cU_svrA4"}`|
> | `400`         | `application/json; charset=utf-8` | `{"statusCode": 400, "message": ["username must contain only letters and numbers","password must be longer than or equal to 5 characters"], "error": "Bad Request"}`|
> | `401`         | `application/json; charset=utf-8` | `{"statusCode": 401, "message": ["Password not match"], "error": "Unauthorized"}`|
> | `404`         | `application/json; charset=utf-8` | `{"statusCode": 404, "message": ["Staff not found"], "error": "Not Found"}`|

##### Example cURL

> ```javascript
>  curl --location 'http://localhost:3000/auth/staff/login' --header 'Content-Type: application/x-www-form-urlencoded' --data-urlencode 'username=admin1' --data-urlencode 'password=1234567890'
> ```
</details>


##### Initialize tables

<details>
 <summary><code>POST</code>
 <code>/booking/table/init</code></summary>

##### Parameters

> | name      |  type     | data type               | description                                                           |
> |-----------|-----------|-------------------------|-----------------------------------------------------------------------|
> | amount    |  required | int                     | table amount                                                          |


##### Responses

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `201`         | `application/json; charset=utf-8` | `{"message": "Initialize table success"}`                           |
> | `400`         | `application/json; charset=utf-8` | `{"statusCode": 400, "message": ["amount must not be less than 1","amount must be a positive number","amount must be an integer number"], "error": "Bad Request"}`|
> | `409`         | `application/json; charset=utf-8` | `{"statusCode": 409, "message": ["Table already initialize"], "error": "Conflict"}`|

##### Example cURL

> ```javascript
>  curl --location 'http://localhost:3000/booking/table/init' --header 'Content-Type: application/x-www-form-urlencoded' --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjg0MDY1NTU0LCJleHAiOjE2ODQwNjYxNTR9.TsGStOiVMPnxRS6mTBLkAA-BfqfR1WNyG-unN3kRrcY' --data-urlencode 'amount=5'
> ```
</details>

##### Reserve tables

<details>
 <summary><code>POST</code>
 <code>/booking/table/reserve</code></summary>

##### Parameters

> | name             |  type      | data type               | description                                                           |
> |------------------|------------|-------------------------|-----------------------------------------------------------------------|
> | customer_name    |  required  | string                  | customer reserve name                                                 |
> | customer_amount  |  required  | int                     | customer reserve amount                                               |
> | booking_time     |  required  | string (ISO format)     | booking time                                                          |


##### Responses

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `200`         | `application/json; charset=utf-8` | `{"freed_table_amount": 4, "table_remaining_amount": 5}`            |
> | `400`         | `application/json; charset=utf-8` | `{"statusCode": 400, "message": ["Please make a reservation 30 minutes in advance"], "error": "Bad Request"}`|

##### Example cURL

> ```javascript
>  curl --location 'http://localhost:3000/booking/table/reserve' --header 'Content-Type: application/x-www-form-urlencoded' --data-urlencode 'customer_name=Samart' --data-urlencode 'customer_amount=14' --data-urlencode 'booking_time=2023-05-14T11:00:00Z'
> ```
</details>

##### Reserve tables

<details>
 <summary><code>PATCH</code>
 <code>/booking/table/cancel</code></summary>

##### Parameters

> | name             |  type      | data type               | description                                                           |
> |------------------|------------|-------------------------|-----------------------------------------------------------------------|
> | booking_id       |  required  | string (UUID format)    | booking id                                                            |


##### Responses

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `201`         | `application/json; charset=utf-8` | `{"booking_id": "3e40f2a5-b099-43f2-b63e-4210e14b64f1", "booking_table_amount": 4, "table_remaining_amount": 1}`                           |
> | `400`         | `application/json; charset=utf-8` | `{"statusCode": 400, "message": ["Booking status cannot cance"], "error": "Bad Request"}`|
> | `404`         | `application/json; charset=utf-8` | `{"statusCode": 400, "message": ["Booking id not found"], "error": "Bad Request"}`|

##### Example cURL

> ```javascript
>  curl --location --request PATCH 'http://localhost:3000/booking/table/cancel' --header 'Content-Type: application/x-www-form-urlencoded' --data-urlencode 'booking_id=294b1d46-7dbb-4868-ab51-b1bf3b4c3b88'
> ```
</details>

##### Use reserve tables

<details>
 <summary><code>PATCH</code>
 <code>/booking/table/use</code></summary>

##### Parameters

> | name             |  type      | data type               | description                                                           |
> |------------------|------------|-------------------------|-----------------------------------------------------------------------|
> | booking_id       |  required  | string (UUID format)    | booking id                                                            |


##### Responses

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `200`         | `application/json; charset=utf-8` | `[{"table_id": 1, "table_name": "Table_1"}, {"table_id": 2, "table_name": "Table_2"}]`                           |
> | `400`         | `application/json; charset=utf-8` | `{"statusCode": 400, "message": ["Sorry, You came too late"], "error": "Bad Request"}`|
> | `404`         | `application/json; charset=utf-8` | `{"statusCode": 400, "message": ["Booking id not found"], "error": "Bad Request"}`|

##### Example cURL

> ```javascript
>  curl --location --request PATCH 'http://localhost:3000/booking/table/use' --header 'Content-Type: application/x-www-form-urlencoded' --data-urlencode 'booking_id=294b1d46-7dbb-4868-ab51-b1bf3b4c3b88'
> ```
</details>

##### Clear tables

<details>
 <summary><code>PATCH</code>
 <code>/booking/table/clear</code></summary>

##### Parameters

> | name             |  type      | data type               | description                                                           |
> |------------------|------------|-------------------------|-----------------------------------------------------------------------|
> | table_ids       |  required  | int array                | table id list                                                         |


##### Responses

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `200`         | `application/json; charset=utf-8` | `{"freed_table_amount": 2,"table_remaining_amount": 7}`             |
> | `400`         | `application/json; charset=utf-8` | `{"statusCode": 400, "message": ["The restaurant is closed"], "error": "Bad Request"}`|

##### Example cURL

> ```javascript
>  curl --location --request PATCH 'http://localhost:3000/booking/table/clear' --header 'Content-Type: application/json' --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjg0MDY1NTU0LCJleHAiOjE2ODQwNjYxNTR9.TsGStOiVMPnxRS6mTBLkAA-BfqfR1WNyG-unN3kRrcY' --data '{"table_ids": [1, 2]}'
> ```
</details>