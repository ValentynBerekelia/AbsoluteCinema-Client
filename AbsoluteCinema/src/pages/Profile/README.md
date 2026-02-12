# Profile Page Documentation

## Overview
The Profile page is a comprehensive user profile management system that allows authenticated users to view their account information and ticket history.

## Features

### 1. User Information Card
- **User Avatar**: Displays the first letter of the username
- **User Details**: Shows username, email, and assigned roles
- **Actions**:
  - **Revoke All Sessions**: Terminate all other active sessions (security feature)
  - **Log Out**: Logout from the current session

### 2. Active Tickets Section
- Displays all active/confirmed tickets
- Shows tickets with status: `Pending` or `Confirmed`
- **Ticket Card Information**:
  - Session date and time
  - Hall name
  - Seat location (row and number)
  - Seat type
  - Ticket price
  - Ticket ID
  - Status badge
  - Cancel button (to cancel the ticket)

### 3. Purchase History Section
- Displays all past and cancelled tickets
- Shows tickets with status: `Used` or `Cancelled`
- Sorted by date (newest first)
- **Read-only view** (no cancellation option for past tickets)

## Usage

### Accessing the Profile Page
1. User must be logged in
2. Click the "Profile" button in the header
3. The page is located at `/profile`

### Component Structure
```
src/pages/Profile/
├── ProfilePage.tsx              # Main page component
├── ProfilePage.css              # Main page styles
├── components/
│   ├── UserInfoCard.tsx         # User info display
│   ├── UserInfoCard.css
│   ├── ActiveTickets.tsx        # Active tickets list
│   ├── ActiveTickets.css
│   ├── TicketHistory.tsx        # Purchase history list
│   ├── TicketHistory.css
│   ├── TicketCard.tsx           # Individual ticket display
│   ├── TicketCard.css
│   └── index.ts                 # Component exports
```

## API Integration

### Endpoints Used
- `GET /api/auth/me` - Get current user info (via AuthContext)
- `GET /api/tickets/user/{userId}` - Get all tickets for a user
- `DELETE /api/ticket/{ticketId}` - Cancel a ticket

### Data Types
All ticket-related types are defined in `src/types/Ticket.ts`:
- `TicketDetails`
- `GetTicketDetailsResponse`
- `SessionForTicket`
- `SeatForTicket`
- `HallForTickets`
- `TicketStatus` enum

## Styling Features

### Responsive Design
- **Desktop**: MultiColumn layout for active tickets (grid)
- **Tablet**: 2-3 column layout
- **Mobile**: Single column layout
- Full mobile optimization for all components

### Visual Elements
- Status badges with color coding:
  - 🟢 Confirmed (green)
  - 🟡 Pending (yellow)
  - ⚫ Used (gray)
  - 🔴 Cancelled (red)
- Smooth hover effects and transitions
- Dark theme matching the app's design
- Custom colors: Orange (#ff6b35) for primary actions

## Error Handling
- Graceful loading states
- Empty state messages when no tickets exist
- Error logging for failed API calls
- User-friendly error messages

## State Management
The component uses React hooks for state management:
- `useState` for local state (tickets, loading, active tab)
- `useEffect` for side effects (fetching tickets, navigation)
- `useAuth` context for user authentication
- `useNavigate` for routing

## Security Features
- Protected route (requires authentication)
- Automatic redirect to login if not authenticated
- Session revocation option
- Secure ticket cancellation with confirmation

## Future Enhancements
- Print/Download ticket as PDF
- QR code generation for tickets
- Ticket transfer functionality
- Advanced filtering and sorting options
- Ticket notifications/reminders
- Refund status tracking
