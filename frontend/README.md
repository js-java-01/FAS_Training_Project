# RBAC System Frontend

React TypeScript frontend for the Role-Based Access Control system.

## Features

- JWT Authentication
- Role-based access control
- Permission-based UI rendering
- User management
- Role management with permission assignment
- Protected routes
- Responsive design with Tailwind CSS

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```env
VITE_API_URL=http://localhost:8080/api
```

## Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Build

```bash
npm run build
```

## Default Credentials

- **Admin**: admin@example.com / password123
- **Student**: student@example.com / password123

## Project Structure

```
src/
├── api/           # API client functions
├── components/    # Reusable components
├── contexts/      # React contexts (Auth)
├── hooks/         # Custom hooks
├── pages/         # Page components
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

## Available Routes

- `/login` - Login page
- `/dashboard` - Main dashboard (requires authentication)
- `/users` - User management (requires USER_READ permission)
- `/roles` - Role management (requires ROLE_READ permission)
- `/unauthorized` - Access denied page

## Key Components

### AuthContext
Manages authentication state and provides auth methods.

### ProtectedRoute
Wrapper component for routes that require authentication and/or specific permissions.

### PermissionGate
Component for conditional rendering based on permissions.

## API Integration

All API calls are made through centralized API service files in the `src/api` directory:
- `authApi.ts` - Authentication
- `userApi.ts` - User operations
- `roleApi.ts` - Role operations
- `permissionApi.ts` - Permission operations
- `menuApi.ts` - Menu operations

The Axios instance in `axiosInstance.ts` automatically:
- Adds JWT token to requests
- Handles 401 unauthorized responses
- Redirects to login on authentication failure
