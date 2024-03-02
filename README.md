# Project Management Server

## Routes

### Auth Routes

| Method | Route        | Description        |
| ------ | ------------ | ------------------ |
| POST   | /auth/signup | Creates a new user |
| POST   | /auth/login  | Logs the user      |
| GET    | /auth/verify | Verifies the JWT   |

### Profiles Routes

| Method | Route            | Description                   |
| ------ | ---------------- | ----------------------------- |
| GET    | /api/profile     | Returns all profiles          |
| GET    | /api/profile/:id | Returns the specified profile |
| POST   | /api/profile     | Creates a new profile         |
| PUT    | /api/profile/:id | Edits the specified profile   |

### Matches Routes

| Method | Route            | Description                 |
| ------ | ---------------- | --------------------------- |
| GET    | /api/matches     | Returns all matches         |
| GET    | /api/matches/:id | Returns the specified match |
| POST   | /api/matches     | Creates a new match         |
| PUT    | /api/matches/:id | Edits the specified match   |
| DELETE | /api/matches/:id | Deletes the specified match |

## Models

### User Model

```js
{
  firstName: String,
	lastName: String,
	email: String,
	password: String,
	isTherapist: Boolean,
	matches: [{type: Schema.Types.ObjectId, ref: ‘Match’}],
	profile: {type: Schema.Types.ObjectId, ref: ‘Profile’}
}
```

### Profile Model

```js
{
  userId: {type: Schema.Types.ObjectId, ref: ‘User’},
	age: Number,
	gender: String,
	location: String,
	therapySetup: [String],
	psyApproach: [String],
	importantTraits: [String],
	price: Number,
	calendarLink: String,
}
```

### Match Model

```js
{
  clientId: {type: Schema.Types.ObjectId, ref: 'Client'},
	therapistId: {type: Schema.Types.ObjectId, ref: ‘Therapist’},
	matchedSetup: Boolean,
	matchedApproach: Boolean,
	matchedPrice: Boolean,
	matchedTraits: Boolean,
	matchStatus: String,
}
```
