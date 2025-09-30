# Air Quality API - Backend

Express.js backend with Prisma ORM and JWT authentication.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Make sure PostgreSQL database is running (Docker container should be up)

3. Environment variables are already configured in `.env`

4. Generate Prisma client and push schema:
```bash
npm run prisma:generate
npm run prisma:push
```

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication

#### Signup
- **POST** `/api/auth/signup`
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
- **POST** `/api/auth/login`
- **Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile (Protected)
- **GET** `/api/auth/profile`
- **Headers:**
```
Authorization: Bearer <your_jwt_token>
```

#### Update Profile (Protected)
- **PATCH** `/api/auth/profile`
- **Headers:**
```
Authorization: Bearer <your_jwt_token>
```
- **Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumbers": ["+1234567890", "+0987654321"],
  "socialUsernames": {
    "twitter": "@johndoe",
    "linkedin": "johndoe",
    "github": "johndoe",
    "instagram": "johndoe"
  }
}
```

## Database

Using Prisma ORM with PostgreSQL. Schema includes:
- User model with email, password, firstName, lastName, phoneNumbers (array), socialUsernames (JSON)

View database in Prisma Studio:
```bash
npm run prisma:studio
```

## Project Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── auth.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── routes/
│   │   └── auth.routes.js
│   └── server.js
├── prisma/
│   └── schema.prisma
├── .env
└── package.json
```
