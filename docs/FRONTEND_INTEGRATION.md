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

## Development Tips

1. **Always check subscription status on app load** to show appropriate UI
2. **Handle 403 SUBSCRIPTION_BLOCKED** responses globally in your HTTP client
3. **Show trial countdown** when `subscription.status === 'TRIAL'`
4. **Cache the token** in localStorage or a secure cookie
5. **Implement token refresh** before expiration (check `exp` claim)
