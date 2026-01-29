# Admin API Documentation

## Axios Client Configuration

**Location**: `src/api/axiosClient.ts`

Base configuration with interceptors for request/response handling.

**Environment Variables**:
- `VITE_API_URL` - Backend API URL (default: `http://localhost:5000/api`)

## API Services

### 1. Movie Service (`src/api/movieService.ts`)

**Endpoints**:
- `GET /admin/movies` - Get all movies
- `GET /admin/movies/:id` - Get movie by ID
- `PUT /admin/movies/:id` - Update movie
- `DELETE /admin/movies/:id` - Delete movie

**Data Structure**:
```typescript
interface MovieUpdateDto {
    title: string;
    duration: string;
    format: string;
    ageLimit: number;
    halls: string[];
    description?: string;
}
```

### 2. Hall Service (`src/api/hallService.ts`)

**Endpoints**:
- `GET /admin/halls` - Get all halls
- `GET /admin/halls/:id` - Get hall by ID

**Data Structure**:
```typescript
interface Hall {
    id: number;
    name: string;
    capacity: number;
    type: string;
}
```

### 3. Client Service (`src/api/clientService.ts`)

**Endpoints**:
- `GET /admin/clients` - Get all clients
- `GET /admin/clients/:id` - Get client by ID

**Data Structure**:
```typescript
interface Client {
    id: number;
    name: string;
    email: string;
    phone: string;
    totalBookings: number;
}
```

### 4. Reservation Service (`src/api/reservationService.ts`)

**Endpoints**:
- `GET /admin/reservations` - Get all reservations
- `GET /admin/reservations/:id` - Get reservation by ID
- `PATCH /admin/reservations/:id/confirm` - Confirm reservation
- `PATCH /admin/reservations/:id/cancel` - Cancel reservation

**Data Structure**:
```typescript
interface Reservation {
    id: number;
    client: string;
    movie: string;
    date: string;
    time: string;
    seats: number;
    status: 'confirmed' | 'pending' | 'cancelled';
}
```

## Features

### Automatic Fallback
All pages automatically fall back to mock data if API is unavailable.

### Loading States
Each page shows loading indicator during data fetch.

### Error Handling
- Global error interceptor in axios client
- Component-level error display with user-friendly messages
- Network errors logged to console

### Mock Data
Located in:
- `src/data/adminMovies.ts` - Movie mock data
- Inline in page components - Other entities

## Backend Requirements

The backend should implement these endpoints with matching data structures. All endpoints should return JSON and handle CORS appropriately for development.
