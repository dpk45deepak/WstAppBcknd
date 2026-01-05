# WstApp Backend API

## 1. Project Overview

### Problem Statement
WstApp is a waste management platform that connects users with drivers for efficient waste pickup and disposal. The backend provides a robust API for user management, authentication, and pickup scheduling.

### Target Users
- Residents looking to schedule waste pickups
- Drivers managing pickups
- Administrators overseeing operations

### Architecture
- **API Layer**: RESTful endpoints for client interactions
- **Authentication**: JWT-based authentication system
- **Data Layer**: MongoDB for data persistence
- **Business Logic**: Modular controllers and services

## 2. Tech Stack

- **Backend Framework**: Node.js with Express
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Dependencies**:
  - bcryptjs: Password hashing
  - jsonwebtoken: Token generation/verification
  - express-validator: Request validation
  - dotenv: Environment variables
  - cors: Cross-origin resource sharing

## 3. Base URL & Environments

| Environment | Base URL | Status |
|-------------|----------|--------|
| Local | `http://localhost:3000/api` | Development |
| Staging | `https://api-staging.wstapp.com/api` | Under Development |
| Production | `https://api.wstapp.com/api` | Planned |

### Required Environment Variables
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/wstapp
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=30d
NODE_ENV=development
```

## 4. Authentication & Authorization

### Authentication Flow
1. User registers with email/password
2. Server returns JWT token
3. Token is stored in client's localStorage/sessionStorage
4. Token is sent in Authorization header for subsequent requests

### Token Storage
- Store JWT in `localStorage` or `sessionStorage`
- Include in request headers: `Authorization: Bearer <token>`

### Token Expiry & Refresh
- Tokens expire in 30 days
- No refresh token implementation (client should re-authenticate)

### Roles
- `user`: Regular users scheduling pickups
- `driver`: Drivers managing pickups
- `admin`: Administrative access

## 5. API Conventions

### Request Format
- Headers:
  ```
  Content-Type: application/json
  Authorization: Bearer <token>
  ```

### Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "AUTH_ERROR",
    "message": "Invalid credentials"
  }
}
```

### Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## 6. API Endpoints

### Authentication

#### Register User
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }
  ```
- **Success Response**: 201 Created
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "123",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user"
      },
      "token": "jwt_token_here"
    },
    "message": "User registered successfully"
  }
  ```

#### Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Success Response**: 200 OK
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "123",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user"
      },
      "token": "jwt_token_here"
    },
    "message": "Login successful"
  }
  ```

### User Profile

#### Get Current User
- **URL**: `/api/users/profile`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**: 200 OK
  ```json
  {
    "success": true,
    "data": {
      "id": "123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### Pickup Management

#### Schedule Pickup
- **URL**: `/api/pickup`
- **Method**: `POST`
- **Auth Required**: Yes (User role)
- **Request Body**:
  ```json
  {
    "pickupDate": "2024-02-01T10:00:00.000Z",
    "address": "123 Main St, City",
    "wasteType": "general",
    "notes": "Backyard pickup"
  }
  ```
- **Success Response**: 201 Created
  ```json
  {
    "success": true,
    "data": {
      "id": "pickup_123",
      "userId": "user_123",
      "status": "scheduled",
      "pickupDate": "2024-02-01T10:00:00.000Z",
      "address": "123 Main St, City",
      "wasteType": "general",
      "notes": "Backyard pickup",
      "createdAt": "2024-01-01T12:00:00.000Z"
    },
    "message": "Pickup scheduled successfully"
  }
  ```

## 7. Data Models

### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string; // hashed
  role: 'user' | 'driver' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}
```

### Pickup
```typescript
interface Pickup {
  id: string;
  userId: string; // Reference to User
  driverId?: string; // Reference to Driver (User with role 'driver')
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  pickupDate: Date;
  address: string;
  wasteType: 'general' | 'recyclable' | 'hazardous' | 'organic';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 8. Frontend Integration Guide

### Making API Calls
```javascript
// Using fetch
const fetchUserProfile = async (token) => {
  try {
    const response = await fetch('http://localhost:3000/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

### Error Handling
```javascript
// Example error handling in React
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const handleSubmit = async (formData) => {
  try {
    setLoading(true);
    setError(null);
    const result = await apiCall(formData);
    // Handle success
  } catch (err) {
    setError(err.message || 'An error occurred');
  } finally {
    setLoading(false);
  }
};
```

## 9. Common Edge Cases

### Unauthorized Access (401)
- **Cause**: Missing or invalid token
- **Solution**: Redirect to login page

### Forbidden (403)
- **Cause**: Insufficient permissions
- **Solution**: Show access denied message

### Not Found (404)
- **Cause**: Resource doesn't exist
- **Solution**: Show 404 page or error message

### Validation Errors (400)
- **Cause**: Invalid request data
- **Solution**: Display validation messages to user

## 10. CORS & Security

### Allowed Origins
- Local: `http://localhost:3000`
- Production: `https://wstapp.com`

### Security Headers
- CORS enabled for whitelisted origins
- Helmet.js for security headers
- Rate limiting in production

## 11. Local Development

### Prerequisites
- Node.js 16+
- MongoDB 5.0+
- npm or yarn

### Setup
```bash
# Clone repository
git clone <repository-url>
cd WstAppBcknd

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

## 12. Sample User Flow

1. **Registration**
   - POST `/api/auth/register`
   - Store JWT token

2. **Login**
   - POST `/api/auth/login`
   - Store new JWT token

3. **Schedule Pickup**
   - POST `/api/pickup` with pickup details
   - Show success message

4. **View Pickups**
   - GET `/api/pickup`
   - Display list of user's pickups

## 13. Future Improvements

- [ ] Implement refresh tokens
- [ ] Add email notifications
- [ ] Real-time updates with WebSockets
- [ ] Payment integration
- [ ] Driver tracking
- [ ] Mobile app API endpoints