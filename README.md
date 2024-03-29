# Project Management Server

## Routes

### Auth Routes

| Method | Route        | Description        |
| ------ | ------------ | ------------------ |
| POST   | /auth/signup | Creates a new user |
| POST   | /auth/login  | Logs the user      |
| GET    | /auth/verify | Verifies the JWT   |

### Profiles Routes

| Method | Route                          | Description                     |
| ------ | ------------------------------ | ------------------------------- |
| GET    | /api/profiles/:userId/:matchId | Returns profile by user & match |
| GET    | /api/profiles/:id              | Returns the specified profile   |
| GET    | /api/users/:id                 | Returns the specified user      |
| POST   | /api/profiles                  | Creates a new profile           |
| PUT    | /api/profiles/:id              | Edits the specified profile     |

### Matches Routes

| Method | Route                | Description                 |
| ------ | -------------------- | --------------------------- |
| GET    | /api/matches/:userId | Returns all matches by user |
| GET    | /api/matches/:id     | Returns the specified match |
| POST   | /api/matches         | Creates a new match         |
| PUT    | /api/matches/:id     | Edits the specified match   |
| DELETE | /api/matches/:id     | Deletes the specified match |

## Models

### User Model

```js
{
	email: String,
	password: String,
    firstName: String,
	lastName: String,
	isTherapist: Boolean,
	matches: [{type: Schema.Types.ObjectId, ref: ‘Match’}],
	profile: {type: Schema.Types.ObjectId, ref: ‘Profile’}
}
```

### Profile Model

```js
{
	age: Number,
	gender: String,
	location: String,
	therapySetup: [String],
	psyApproach: [String],
	price: Number,
	description: String,
	addressStreet: String,
	addressCode: String,
	calendarLink: String,
	picture: String,
	user: {type: Schema.Types.ObjectId, ref: ‘User’},
}
```

### Match Model

```js
{
  client: {type: Schema.Types.ObjectId, ref: 'Client'},
	therapist: {type: Schema.Types.ObjectId, ref: ‘Therapist’},
	matchedSetup: Boolean,
	matchedApproach: Boolean,
	matchedPrice: Boolean,
	matchStatus: String,
}
```
