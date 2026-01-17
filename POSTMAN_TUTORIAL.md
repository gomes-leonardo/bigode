# Postman API Testing Tutorial

This guide explains how to test all Bigode API endpoints using Postman.

## Prerequisites

1. Start the server: `npm run dev`
2. Server runs at `http://localhost:3333`

## Environment Setup

Create a Postman environment with these variables:

| Variable        | Initial Value                                                               |
| --------------- | --------------------------------------------------------------------------- |
| `base_url`      | `http://localhost:3333`                                                     |
| `booking_token` | _(leave empty, extracted from booking URL)_                                 |
| `barbershopId`  | `550e8400-e29b-41d4-a716-446655440100` _(The Paula Barber test barbershop)_ |
| `barberId`      | `550e8400-e29b-41d4-a716-446655440101` _(John Doe - test barber)_           |
| `serviceId`     | `550e8400-e29b-41d4-a716-446655440103` _(Haircut - test service)_           |

---

## Endpoints

### 1. Health Check

Verify the API and database connection status.

**Request:**

```
GET {{base_url}}/health
```

**Headers:** None required

**Response (200 OK):**

```json
{
  "status": "healthy",
  "database": {
    "status": "connected",
    "openConnections": 1
  }
}
```

**Response (503 Service Unavailable):**

```json
{
  "status": "unhealthy",
  "database": {
    "status": "disconnected"
  }
}
```

---

### 2. Create Booking Link (Secure Authentication)

Creates a secure, opaque booking link for a customer. This endpoint is called by the barbershop system (not the customer).

**Security Features:**

- Generates cryptographically secure token (256 bits)
- No sensitive data in URL
- Token expires in 15 minutes
- Single-use by default

**Request:**

```
POST {{base_url}}/auth/booking-link
```

**Headers:**

```
Content-Type: application/json
```

**Body (raw JSON):**

```json
{
  "barbershopId": "550e8400-e29b-41d4-a716-446655440001",
  "barberId": "550e8400-e29b-41d4-a716-446655440000",
  "customerPhone": "+5511999999999"
}
```

> **Note:** `barberId` is optional. If omitted, customer can choose a barber later.

**Response (201 Created):**

```json
{
  "bookingUrl": "http://localhost:3000/booking/X7kL9mN2pQ4rT8wY1zA3bC5dE7fG9hI0jK2lM4nO6pQ",
  "expiresAt": "2024-01-15T10:15:00.000Z"
}
```

**Auto-extract token (Tests tab):**

```javascript
const response = pm.response.json();
const token = response.bookingUrl.split("/booking/")[1];
pm.environment.set("booking_token", token);
```

**Error Responses:**

| Status | Code                                | Message                             |
| ------ | ----------------------------------- | ----------------------------------- |
| 400    | Validation error                    | Invalid input data                  |
| 404    | Barbershop not found                | Barbershop ID doesn't exist         |
| 404    | Barber not found in this barbershop | Barber doesn't belong to barbershop |

---

### 3. Validate Booking Token (Start Session)

Validates the booking token and creates a session. This is called when the customer clicks the booking link.

**Security Features:**

- Token is validated against hash in database
- Checks expiration and usage status
- Rate limited (max 5 attempts per minute)
- Sets HttpOnly session cookie

**Request:**

```
GET {{base_url}}/auth/booking/{{booking_token}}
```

**Headers:** None required

**Response (200 OK):**

```json
{
  "message": "Booking session started",
  "barbershopId": "550e8400-e29b-41d4-a716-446655440001",
  "barberId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response Headers:**

```
Set-Cookie: session=eyJhbGciOiJIUzI1NiIs...; Path=/; HttpOnly; SameSite=Strict
```

**Error Responses:**

| Status | Code          | Message                                 |
| ------ | ------------- | --------------------------------------- |
| 400    | -             | Invalid booking link (token too short)  |
| 404    | INVALID_TOKEN | Invalid booking link                    |
| 410    | TOKEN_EXPIRED | This booking link has expired           |
| 410    | TOKEN_USED    | This booking link has already been used |
| 429    | RATE_LIMITED  | Too many attempts                       |

---

### 4. List Barbers by Barbershop

Retrieves all barbers from a barbershop with their availability schedules.

**Request:**

```
GET {{base_url}}/barbershops/{{barbershopId}}/barbers
```

**Headers:** None required

**Response (200 OK):**

```json
{
  "barbers": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440101",
      "name": "John Doe",
      "schedules": [
        {
          "dayOfWeek": 1,
          "startTime": "09:00",
          "endTime": "18:00",
          "isActive": true,
          "breaks": [{ "startTime": "12:00", "endTime": "13:00" }]
        },
        {
          "dayOfWeek": 2,
          "startTime": "09:00",
          "endTime": "18:00",
          "isActive": true,
          "breaks": [{ "startTime": "12:00", "endTime": "13:00" }]
        }
      ]
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440102",
      "name": "Jane Smith",
      "schedules": [
        {
          "dayOfWeek": 2,
          "startTime": "10:00",
          "endTime": "19:00",
          "isActive": true,
          "breaks": []
        }
      ]
    }
  ]
}
```

**Schedule Fields:**

| Field       | Type         | Description                          |
| ----------- | ------------ | ------------------------------------ |
| `dayOfWeek` | number (0-6) | 0=Sunday, 1=Monday, ..., 6=Saturday  |
| `startTime` | string       | Work start time in HH:mm format      |
| `endTime`   | string       | Work end time in HH:mm format        |
| `isActive`  | boolean      | Whether this schedule is active      |
| `breaks`    | array        | List of break periods during the day |

**Response (404 Not Found):**

```json
{
  "message": "Barbershop not found"
}
```

**Response (400 Bad Request):**

```json
{
  "message": "Validation error",
  "errors": { "barbershopId": { "_errors": ["Invalid uuid"] } }
}
```

**Auto-extract first barber ID (Tests tab):**

```javascript
const response = pm.response.json();
if (response.barbers && response.barbers.length > 0) {
  pm.environment.set("barberId", response.barbers[0].id);
}
```

---

### 5. Get Availability

Retrieves available time slots for a barber on a specific date.

**Request:**

```
GET {{base_url}}/availability?barberId=550e8400-e29b-41d4-a716-446655440000&date=2024-01-15
```

**Headers:** None required

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `barberId` | UUID | Yes | The barber's unique identifier |
| `date` | Date (YYYY-MM-DD) | Yes | The date to check availability |

**Response (200 OK):**

```json
{
  "slots": [
    {
      "startTime": "2024-01-15T11:00:00.000Z",
      "endTime": "2024-01-15T11:30:00.000Z"
    },
    {
      "startTime": "2024-01-15T11:30:00.000Z",
      "endTime": "2024-01-15T12:00:00.000Z"
    },
    {
      "startTime": "2024-01-15T12:00:00.000Z",
      "endTime": "2024-01-15T12:30:00.000Z"
    }
  ]
}
```

**Notes:**

- Returns only **available** slots (not booked)
- Filters out past time slots automatically
- Returns empty array for past dates
- Slots are 30 minutes, from 9:00 AM to 6:00 PM

---

### 6. Create Appointment

Creates a new appointment. **Requires session cookie** (set by token validation).

**Request:**

```
POST {{base_url}}/appointments
```

**Headers:**

```
Content-Type: application/json
Cookie: session={{session_cookie}}
```

> **Note:** If using Postman, cookies are automatically included after validating the booking token.

**Body (raw JSON):**

```json
{
  "barberId": "550e8400-e29b-41d4-a716-446655440000",
  "serviceId": "550e8400-e29b-41d4-a716-446655440004",
  "startTime": "2024-01-15T10:00:00.000Z"
}
```

**Response (201 Created):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440005",
  "startTime": "2024-01-15T10:00:00.000Z",
  "endTime": "2024-01-15T10:30:00.000Z",
  "status": "SCHEDULED",
  "barberId": "550e8400-e29b-41d4-a716-446655440000",
  "barbershopId": "550e8400-e29b-41d4-a716-446655440001",
  "customerId": "550e8400-e29b-41d4-a716-446655440003",
  "serviceId": "550e8400-e29b-41d4-a716-446655440004"
}
```

**Error Responses:**

| Status | Code         | Message                                    |
| ------ | ------------ | ------------------------------------------ |
| 401    | Unauthorized | Missing or invalid session                 |
| 404    | -            | Service not found                          |
| 409    | -            | Appointment already exists (slot occupied) |

---

## Testing Flow

Follow this order to test the complete booking flow:

```
1. Health Check
   └── Verify API is running

2. Create Booking Link
   └── Generate secure booking URL
   └── Extract token for next step

3. Validate Booking Token
   └── Validate token and start session
   └── Session cookie is set automatically

4. List Barbers
   └── Get all barbers with schedules
   └── Select barber for booking

5. Get Availability
   └── Check available slots for selected date

6. Create Appointment
   └── Book an available slot
   └── Session cookie sent automatically
```

## Sample Data Setup

You can use the test seed to create sample data:

```bash
npm run seed:test
```

This creates "The Paula Barber" test barbershop with:

| Entity        | ID                                     | Details                                |
| ------------- | -------------------------------------- | -------------------------------------- |
| Barbershop    | `550e8400-e29b-41d4-a716-446655440100` | "The Paula Barber"                     |
| Barber (John) | `550e8400-e29b-41d4-a716-446655440101` | Mon-Fri 09:00-18:00, lunch 12:00-13:00 |
| Barber (Jane) | `550e8400-e29b-41d4-a716-446655440102` | Tue-Sat 10:00-19:00, no breaks         |
| Service       | `550e8400-e29b-41d4-a716-446655440103` | Haircut, 30 min, $35                   |

Alternatively, use Prisma Studio to create custom data:

```bash
npx prisma studio
```

## Postman Collection Structure

```
Bigode API
├── Health
│   └── GET Health Check
├── Auth
│   ├── POST Create Booking Link
│   └── GET Validate Booking Token
├── Barbershops
│   └── GET List Barbers by Barbershop
└── Scheduling
    ├── GET Get Availability
    └── POST Create Appointment
```

## Security Notes

### Token Security

- Booking tokens are **256-bit cryptographically random**
- Only the **hash** is stored in the database
- Tokens **expire in 15 minutes**
- Tokens are **single-use** by default

### Session Security

- Session JWT delivered via **HttpOnly cookie**
- Cookie has **SameSite=Strict** for CSRF protection
- Session expires in **30 minutes**
- **No sensitive data** in JWT payload

### Rate Limiting

- Token validation: **5 attempts per minute**
- After limit: 1-minute cooldown

## Common Issues

| Issue                | Solution                                            |
| -------------------- | --------------------------------------------------- |
| Connection refused   | Ensure server is running: `npm run dev`             |
| Database unhealthy   | Check Docker: `npm run services:up`                 |
| TOKEN_EXPIRED        | Create a new booking link (tokens expire in 15 min) |
| TOKEN_USED           | Create a new booking link (tokens are single-use)   |
| RATE_LIMITED         | Wait 1 minute before retrying                       |
| 401 Unauthorized     | Validate booking token first to get session cookie  |
| Barbershop not found | Create barbershop in database first                 |
| Service not found    | Create service linked to barbershop first           |
