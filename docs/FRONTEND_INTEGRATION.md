# Frontend Integration Guide

This guide explains how to integrate a frontend application with the Bigode API.

## Base URL

- **Local Development**: `http://localhost:3333`
- **Production**: `https://api.bigode.app` (configure in env)

## Authentication

### Admin Authentication Flow

The admin panel uses WhatsApp OTP authentication:

```
1. POST /admin/auth/request-otp
   Body: { phone: "+5511999990001" }
   Response: { success: true, message: string, expiresAt: string, devCode?: string }

   Note: In development mode, the OTP code is returned as `devCode` for testing.

2. POST /admin/auth/verify-otp
   Body: { phone: "+5511999990001", code: "123456" }
   Response: { admin: {...}, token: string, expiresAt: string }

   The token should be stored and sent in the Authorization header.
```

### Using the Token

All authenticated endpoints require the JWT token:

```javascript
// Using fetch
fetch("/admin/barbers", {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

// Using axios
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
```

## Onboarding Flow (Signup)

### Creating a New Barbershop

```javascript
// POST /barbershops
const response = await fetch('/barbershops', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "Barbearia do Zé",
    slug: "barbearia-do-ze",      // URL-friendly identifier
    phone: "+5511999990000",      // Barbershop WhatsApp
    ownerEmail: "ze@email.com",
    ownerPhone: "+5511999990001", // Owner's phone for admin login
    ownerName: "José Silva"
  })
});

// Response
{
  barbershop: {
    id: "uuid",
    name: "Barbearia do Zé",
    slug: "barbearia-do-ze",
    subscriptionStatus: "TRIAL",
    // ...
  },
  admin: {
    id: "uuid",
    email: "ze@email.com",
    phone: "+5511999990001",
    name: "José Silva",
    role: "OWNER"
  },
  trialInfo: {
    startsAt: "2026-01-18T...",
    endsAt: "2026-02-17T...",
    daysRemaining: 30
  }
}
```

## Subscription Status Handling

### Checking Subscription Status

```javascript
// GET /admin/subscription (always accessible after login)
const response = await fetch('/admin/subscription', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Response
{
  subscription: {
    status: "TRIAL",           // TRIAL | ACTIVE | PAST_DUE | CANCELED | EXPIRED
    tier: "FREE",              // FREE | PREMIUM | PRO
    isActive: true,
    trial: {
      startedAt: "2026-01-18T...",
      endsAt: "2026-02-17T...",
      daysRemaining: 25
    },
    hasStripeSubscription: false
  },
  actions: {
    canUpgrade: true,
    canManageBilling: false,
    upgradeUrl: "/admin/subscription/upgrade",
    billingUrl: null
  }
}
```

### Handling Subscription Blocked (403)

When a subscription is expired or canceled, subscription-required endpoints return 403:

```javascript
// Response when blocked
{
  message: "Subscription inactive",
  code: "SUBSCRIPTION_BLOCKED",
  reason: "Your 30-day trial has expired...",
  action: {
    type: "UPGRADE_REQUIRED",
    url: "/admin/subscription/upgrade"
  }
}

// Frontend handling
if (response.status === 403 && data.code === 'SUBSCRIPTION_BLOCKED') {
  // Show upgrade modal or redirect to subscription page
  router.push(data.action.url);
}
```

### Routes Always Accessible (no subscription check)

These routes work even when subscription is expired:

- `GET /admin/me` - Current admin info
- `GET /admin/barbershop` - Barbershop info
- `GET /admin/subscription` - Subscription status
- `POST /admin/auth/logout` - Logout

## Admin Panel Endpoints

### Barbers CRUD

```javascript
// List barbers
GET /admin/barbers

// Create barber
POST /admin/barbers
Body: {
  name: "Carlos",
  phone: "+5511988887777",
  schedules: [
    {
      dayOfWeek: 1,        // 0=Sunday, 1=Monday, ..., 6=Saturday
      startTime: "09:00",  // HH:mm format
      endTime: "18:00",
      isActive: true,
      breaks: [
        { startTime: "12:00", endTime: "13:00" }
      ]
    }
  ]
}

// Update barber
PATCH /admin/barbers/:id
Body: { name?: string, phone?: string, schedules?: Schedule[] }

// Delete barber
DELETE /admin/barbers/:id
```

### Services CRUD

```javascript
// List services
GET /admin/services

// Create service
POST /admin/services
Body: {
  name: "Corte Masculino",
  durationMin: 30,        // Duration in minutes
  price: 45.00            // Price in BRL
}

// Update service
PATCH /admin/services/:id
Body: { name?: string, durationMin?: number, price?: number }

// Delete service
DELETE /admin/services/:id
```

### Barbershop Settings

```javascript
// Get barbershop info (always accessible)
GET /admin/barbershop

// Update barbershop (requires active subscription)
PATCH /admin/barbershop
Body: {
  name?: string,
  phone?: string,
  timezone?: string,
  isQueueEnabled?: boolean,
  isAppointmentsEnabled?: boolean
}
```

## Error Handling

### Standard Error Responses

```javascript
// Validation Error (400)
{
  message: "Validation error",
  errors: { /* Zod error format */ }
}

// Not Found (404)
{
  message: "Barber not found",
  code: "BARBER_NOT_FOUND"
}

// Conflict (409)
{
  message: "Barbershop with slug \"test\" already exists",
  code: "SLUG_EXISTS",
  field: "slug"
}

// Authentication Required (401)
{
  message: "Authentication required",
  code: "UNAUTHORIZED"
}

// Subscription Blocked (403)
{
  message: "Subscription inactive",
  code: "SUBSCRIPTION_BLOCKED",
  reason: "...",
  action: { type: "UPGRADE_REQUIRED", url: "..." }
}
```

## React Integration Example

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from "react";

export function useAuth() {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("adminToken"),
  );
  const [admin, setAdmin] = useState(null);

  const login = async (phone: string, code: string) => {
    const res = await fetch("/admin/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    });

    const data = await res.json();
    if (data.token) {
      localStorage.setItem("adminToken", data.token);
      setToken(data.token);
      setAdmin(data.admin);
    }
    return data;
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
    setAdmin(null);
  };

  return { token, admin, login, logout };
}

// hooks/useSubscription.ts
export function useSubscription(token: string) {
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    fetch("/admin/subscription", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setSubscription);
  }, [token]);

  const isActive = subscription?.subscription?.isActive ?? false;
  const daysRemaining = subscription?.subscription?.trial?.daysRemaining;

  return { subscription, isActive, daysRemaining };
}
```

## Complete Booking Flow

This section describes the full appointment booking flow for both customer-facing apps and admin panels.

### Customer Booking Flow (Public App)

#### Step 1: Get Available Services and Barbers

```javascript
// Get barbershop public info by slug
GET /booking/:slug
// Response: { barbershop, barbers, services }

// Or fetch services and barbers separately
GET /barbershops/:slug/services
GET /barbershops/:slug/barbers
```

#### Step 2: Check Availability

```javascript
// Get available time slots for a specific barber and date
GET /availability?barberId={barberId}&date=2026-01-20&duration=30

// Response
{
  "barberId": "uuid",
  "date": "2026-01-20",
  "slots": [
    { "time": "09:00", "available": true },
    { "time": "09:30", "available": true },
    { "time": "10:00", "available": false },
    // ...
  ]
}
```

#### Step 3: Customer Authentication

```javascript
// Request OTP
POST /auth/request-otp
Body: { phone: "+5511999999999", barbershopId: "uuid" }

// Verify OTP and get token
POST /auth/verify-otp
Body: { phone: "+5511999999999", code: "123456" }
// Response: { token, customer: { id, phone, name } }
```

#### Step 4: Create Appointment

```javascript
// Create appointment (requires customer JWT)
POST /appointments
Headers: { Authorization: "Bearer {customerToken}" }
Body: {
  barberId: "uuid",
  serviceId: "uuid",
  startTime: "2026-01-20T14:00:00.000Z"  // ISO 8601 format
}

// Response (201 Created)
{
  appointment: {
    id: "uuid",
    startTime: "2026-01-20T14:00:00.000Z",
    endTime: "2026-01-20T14:30:00.000Z",
    status: "SCHEDULED",
    barberId: "uuid",
    serviceId: "uuid",
    barbershopId: "uuid"
  },
  message: "Appointment created successfully. Confirmation sent via WhatsApp."
}

// Error responses
// 400 - Validation error (invalid UUID, missing fields)
// 404 - Service or Barber not found
// 409 - Slot occupied (appointment already exists at that time)
```

#### Step 5: View Customer Appointments

```javascript
// Get customer's appointments
GET / appointments;
Headers: {
  Authorization: "Bearer {customerToken}";
}

// Response
{
  appointments: [
    {
      id: "uuid",
      startTime: "2026-01-20T14:00:00.000Z",
      endTime: "2026-01-20T14:30:00.000Z",
      status: "SCHEDULED",
      barber: { id: "uuid", name: "Carlos" },
      service: { id: "uuid", name: "Corte", price: 45.0, durationMin: 30 },
    },
  ];
}
```

### Admin Appointment Management

#### List Appointments (with filters)

```javascript
// List all appointments (defaults to today)
GET /admin/appointments
Headers: { Authorization: "Bearer {adminToken}" }

// With filters
GET /admin/appointments?startDate=2026-01-20&endDate=2026-01-27&barberId=uuid&status=SCHEDULED

// Response
{
  appointments: [
    {
      id: "uuid",
      startTime: "2026-01-20T14:00:00.000Z",
      endTime: "2026-01-20T14:30:00.000Z",
      status: "SCHEDULED",
      barber: { id: "uuid", name: "Carlos" },
      service: { id: "uuid", name: "Corte", price: 45.00, durationMin: 30 },
      customer: { phone: "+5511999999999", name: "João Silva" }
    }
  ],
  filters: {
    startDate: "2026-01-20",
    endDate: "2026-01-20",
    barberId: null,
    status: null
  },
  total: 15
}
```

#### Get Single Appointment

```javascript
// Get appointment details
GET /admin/appointments/:id
Headers: { Authorization: "Bearer {adminToken}" }

// Response
{
  appointment: {
    id: "uuid",
    startTime: "2026-01-20T14:00:00.000Z",
    endTime: "2026-01-20T14:30:00.000Z",
    status: "SCHEDULED",
    barber: { id: "uuid", name: "Carlos" },
    service: { id: "uuid", name: "Corte", price: 45.00, durationMin: 30 },
    customer: { phone: "+5511999999999", name: "João Silva" }
  }
}

// Error responses
// 404 - Appointment not found
```

#### Cancel Appointment

```javascript
// Cancel an appointment (sends WhatsApp notification to customer)
POST /admin/appointments/:id/cancel
Headers: { Authorization: "Bearer {adminToken}" }
Body: { reason?: "Barber unavailable" }  // Optional reason

// Response
{
  message: "Appointment canceled successfully",
  appointment: {
    id: "uuid",
    status: "CANCELED",
    // ... full appointment details
  }
}

// Error responses
// 404 - Appointment not found
// 409 - Appointment already canceled or completed
```

#### Update Appointment Status

```javascript
// Mark as completed or no-show
PATCH /admin/appointments/:id/status
Headers: { Authorization: "Bearer {adminToken}" }
Body: { status: "COMPLETED" }  // or "NO_SHOW"

// Response
{
  message: "Appointment marked as completed",
  appointment: {
    id: "uuid",
    status: "COMPLETED",
    // ... full appointment details
  }
}

// Error responses
// 404 - Appointment not found
// 409 - Invalid status transition (e.g., can't complete a canceled appointment)
```

### Appointment Status Flow

```
                    ┌─────────────────┐
                    │    SCHEDULED    │
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
     ┌──────────┐     ┌──────────┐     ┌──────────┐
     │ COMPLETED│     │ CANCELED │     │  NO_SHOW │
     └──────────┘     └──────────┘     └──────────┘

Valid transitions from SCHEDULED:
- SCHEDULED → COMPLETED (service was performed)
- SCHEDULED → CANCELED (appointment was canceled)
- SCHEDULED → NO_SHOW (customer didn't show up)

Note: Once an appointment leaves SCHEDULED status, it cannot be changed again.
```

### React Integration Example (Booking Flow)

```typescript
// hooks/useBooking.ts
import { useState } from 'react';

interface BookingState {
  barberId: string | null;
  serviceId: string | null;
  date: string | null;
  time: string | null;
}

export function useBooking(token: string, barbershopSlug: string) {
  const [state, setState] = useState<BookingState>({
    barberId: null,
    serviceId: null,
    date: null,
    time: null,
  });

  const fetchAvailability = async (barberId: string, date: string, duration: number) => {
    const res = await fetch(
      `/availability?barberId=${barberId}&date=${date}&duration=${duration}`
    );
    return res.json();
  };

  const createAppointment = async () => {
    if (!state.barberId || !state.serviceId || !state.date || !state.time) {
      throw new Error('Incomplete booking data');
    }

    const startTime = new Date(`${state.date}T${state.time}:00.000Z`).toISOString();

    const res = await fetch('/appointments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        barberId: state.barberId,
        serviceId: state.serviceId,
        startTime,
      }),
    });

    if (res.status === 409) {
      throw new Error('This time slot is no longer available');
    }

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message);
    }

    return res.json();
  };

  return {
    state,
    setState,
    fetchAvailability,
    createAppointment,
  };
}

// components/AppointmentList.tsx (Admin)
export function AppointmentList({ token }: { token: string }) {
  const [appointments, setAppointments] = useState([]);
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const params = new URLSearchParams(filters);
    fetch(`/admin/appointments?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setAppointments(data.appointments));
  }, [filters, token]);

  const cancelAppointment = async (id: string, reason?: string) => {
    const res = await fetch(`/admin/appointments/${id}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    if (res.ok) {
      // Refresh list
      setFilters({ ...filters });
    }
  };

  const markAsCompleted = async (id: string) => {
    await fetch(`/admin/appointments/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'COMPLETED' }),
    });
    setFilters({ ...filters });
  };

  return (
    // ... render appointments with actions
  );
}
```

### WhatsApp Notifications

The API automatically sends WhatsApp notifications in the following scenarios:

| Event                           | Recipient | Message Content                               |
| ------------------------------- | --------- | --------------------------------------------- |
| Appointment Created             | Customer  | Confirmation with date, time, service, barber |
| Appointment Canceled (by admin) | Customer  | Cancellation notice with optional reason      |

**Note**: Notifications are fire-and-forget (non-blocking). The API response is returned immediately without waiting for WhatsApp delivery.

## Testing with Postman

1. Import `postman/Bigode_API_Collection.json`
2. Import `postman/Bigode_Local_Environment.json`
3. Select "Bigode - Local" environment
4. Run requests in order:
   - Health Check
   - Create Barbershop (saves variables)
   - Request OTP (saves devCode)
   - Verify OTP (saves token)
   - Use other endpoints

### Testing Booking Flow

1. **Create test data**: Create barbershop → Create barber → Create service
2. **Customer auth**: Request OTP → Verify OTP (get customer token)
3. **Check availability**: GET /availability with barberId and date
4. **Book appointment**: POST /appointments with barberId, serviceId, startTime
5. **Admin management**: List → Get details → Mark complete or Cancel

## Development Tips

1. **Always check subscription status on app load** to show appropriate UI
2. **Handle 403 SUBSCRIPTION_BLOCKED** responses globally in your HTTP client
3. **Show trial countdown** when `subscription.status === 'TRIAL'`
4. **Cache the token** in localStorage or a secure cookie
5. **Implement token refresh** before expiration (check `exp` claim)
