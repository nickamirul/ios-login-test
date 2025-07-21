# Backend iOS Auth API

A robust Node.js Express backend with MongoDB for user authentication, built with security and scalability in mind.

## 🚀 Features

- **Secure Authentication**: JWT-based authentication with access and refresh tokens
- **User Management**: Complete user lifecycle (signup, signin, signout, profile management)
- **Security First**: Rate limiting, input validation, password hashing, security headers
- **API Versioning**: Clean RESTful API with versioning (`/api/v1`)
- **Database**: MongoDB with Mongoose ODM
- **Error Handling**: Comprehensive error handling and consistent API responses
- **Input Validation**: Express-validator for request validation
- **Logging**: Morgan for request logging
- **CORS**: Configurable cross-origin resource sharing

## 📋 Prerequisites

- Node.js (v16.0.0 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend-ios
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/backend-ios-auth
   JWT_ACCESS_SECRET=your_super_secret_access_key_here
   JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
   JWT_ACCESS_EXPIRE=15m
   JWT_REFRESH_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   - Local: `mongod`
   - Or use MongoDB Atlas (cloud)

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

#### 1. User Signup
```http
POST /api/v1/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "statusCode": 201,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isEmailVerified": false,
      "lastLogin": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token",
      "accessTokenExpiresIn": "15m",
      "refreshTokenExpiresIn": "7d"
    }
  }
}
```

#### 2. User Signin
```http
POST /api/v1/auth/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### 3. User Signout
```http
POST /api/v1/auth/signout
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "refreshToken": "jwt_refresh_token" // Optional
}
```

#### 4. Signout All Devices
```http
POST /api/v1/auth/signout-all
Authorization: Bearer <access_token>
```

#### 5. Refresh Access Token
```http
POST /api/v1/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "jwt_refresh_token"
}
```

#### 6. Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <access_token>
```

#### 7. Update Profile
```http
PUT /api/v1/auth/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

#### 8. Change Password
```http
PUT /api/v1/auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

#### 9. Deactivate Account
```http
PUT /api/v1/auth/deactivate
Authorization: Bearer <access_token>
```

### Utility Endpoints

#### Health Check
```http
GET /health
```

#### API Info
```http
GET /api/v1
```

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds of 12
- **JWT Tokens**: Separate access (15min) and refresh (7 days) tokens
- **Rate Limiting**: 
  - Authentication endpoints: 5 requests per 15 minutes
  - Signup: 3 requests per hour
  - General API: 100 requests per 15 minutes
- **Input Validation**: Comprehensive validation for all inputs
- **Security Headers**: Helmet.js for security headers
- **CORS**: Configurable cross-origin resource sharing
- **Database Security**: MongoDB indexes and data sanitization

## 📁 Project Structure

```
backend-ios/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   └── authController.js    # Authentication logic
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── errorHandler.js      # Global error handling
│   │   └── rateLimiter.js       # Rate limiting configs
│   ├── models/
│   │   └── User.js              # User schema
│   ├── routes/
│   │   └── v1/
│   │       ├── index.js         # V1 routes aggregator
│   │       └── auth.js          # Authentication routes
│   ├── utils/
│   │   ├── response.js          # Response utilities
│   │   └── validation.js        # Validation schemas
│   └── app.js                   # Express app setup
├── server.js                    # Server entry point
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## 🧪 Testing with cURL

### Signup
```bash
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123"
  }'
```

### Signin
```bash
curl -X POST http://localhost:5000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

### Get User Info (Replace TOKEN with actual access token)
```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## 🔧 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | No | `development` |
| `PORT` | Server port | No | `5000` |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_ACCESS_SECRET` | JWT access token secret | Yes | - |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | Yes | - |
| `JWT_ACCESS_EXPIRE` | Access token expiry | No | `15m` |
| `JWT_REFRESH_EXPIRE` | Refresh token expiry | No | `7d` |
| `FRONTEND_URL` | Frontend URL for CORS | No | `*` |

## 🚀 Deployment

### Using PM2
```bash
npm install -g pm2
pm2 start server.js --name "backend-ios-auth"
```

### Using Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
USER node
CMD ["npm", "start"]
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 