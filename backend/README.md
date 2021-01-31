# FHNW-SQL-Training-Game-API


## Endpoints

Possible codes: 
* `200: Success`
* `400: Bad Request`
* `401: Unauthorized`
* `500: Internal Server Error`


### Users

* `POST: /users/register`
  * `username:string`
  * `password:string`
* `POST: /users/authenticate`
  * `username:string`
  * `password:string`
* `POST: /users/recover`
  * `username:string`
* `POST: /users/reset`
  * `token:string`
  * `password:string`
* `GET: /users/self`
* `PATCH: /users/self/answer_sql`
  * `task:string`
  * `success:bool`
  * `query:string`


## Configuration
### Environment Variables
* `NODE_ENV`
* `PORT`
* `MONGODB_URI`
* `POSTMARK_API_KEY`