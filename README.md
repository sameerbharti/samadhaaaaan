# Samadhan - Complaint Management System

A comprehensive, production-ready web application for registering and managing complaints related to municipal issues with modern UI/UX inspired by Fretbox.

## Application Overview

This is a comprehensive, production-ready web application designed for registering and managing municipal complaints. It features a modern UI/UX inspired by Fretbox and is built as a full-stack application using the MERN stack.

### Technology Stack

#### Frontend
- React.js with modern hooks and context API
- Material UI v5 for modern UI components
- Recharts for data visualization
- React Router for navigation
- React Leaflet for map integration
- Axios for API communication

#### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Multer for file uploads

## Key Functionalities

### 1. User Authentication System
- Registration and login with email verification
- JWT-based authentication with secure tokens
- Role-based access control (User, Officer, Admin)

### 2. Complaint Management
- Create Complaints: Users can submit complaints with titles, descriptions, categories, priorities, and location
- Complaint Categories: street_light, water_pipe, rain_drainage, road_reconstruction, garbage_system, other
- Priority Levels: low, medium, high
- Status Tracking: pending, in_progress, resolved, rejected
- Image Attachments: Upload images as evidence for complaints
- Location Mapping: Geographic coordinates for complaints

### 3. Role-based Access & Features
- Users: Submit complaints, track their own complaints, provide feedback
- Officers: Access to assigned complaints, update status, add proof of work
- Admins: Complete system oversight, user management, complaint assignment

### 4. Advanced Features
- Complaint Assignment: Admins can assign complaints to specific officers
- Feedback System: Users can rate and provide feedback on resolved complaints
- Voting System: Users can like/dislike complaints
- Real-time Tracking: Track complaint status in real-time
- Proof of Work: Officers can upload images showing completed work

### 5. Dashboard & Analytics
- Comprehensive admin dashboard with data visualization
- Status counts and complaint statistics
- Performance metrics and analytics

### 6. Administrative Functions
- User management (create, update, delete users)
- Officer management and assignment
- Report generation and complaint analytics
- System monitoring and health check endpoints

### 7. Performance Optimizations
- Code splitting with React.lazy() and Suspense
- Skeleton screens for loading states
- Optimized image handling and compression
- Database query optimizations
- Bundle size optimization with tree-shaking

### 8. Security Features
- JWT-based authentication with secure tokens
- Input validation and sanitization
- Rate limiting to prevent abuse
- CORS configuration for secure cross-origin requests
- Password hashing with bcrypt
- Secure session management

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Complaints
- `POST /api/complaints` - Create a new complaint
- `GET /api/complaints` - Get all complaints (admin/officer) or user's complaints
- `GET /api/complaints/mine` - Get current user's complaints
- `GET /api/complaints/:id` - Get a specific complaint
- `PUT /api/complaints/:id` - Update a complaint
- `DELETE /api/complaints/:id` - Delete a complaint
- `PUT /api/complaints/:id/feedback` - Add feedback to a complaint
- `POST /api/complaints/:id/like` - Like a complaint
- `POST /api/complaints/:id/dislike` - Dislike a complaint

### Officers
- `GET /api/officers` - Get all officers
- `POST /api/officers` - Create a new officer
- `PUT /api/officers/:id` - Update an officer
- `DELETE /api/officers/:id` - Delete an officer
- `PUT /api/officers/:id/assign-complaint/:complaintId` - Assign a complaint to an officer

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get a specific user
- `PUT /api/admin/users/:id` - Update a user
- `DELETE /api/admin/users/:id` - Delete a user
- `GET /api/admin/reports/complaints` - Get complaint reports
- `GET /api/admin/stats/status-counts` - Get status counts
- `GET /api/admin/dashboard/stats` - Get admin dashboard stats

## Architecture

The application follows modern React patterns with:
- Context API for state management
- Custom hooks for reusable logic
- Component composition for flexibility
- Proper separation of concerns
- Clean, maintainable code structure

This is a well-structured, production-ready complaint management system that enables citizens to report municipal issues and track their resolution while providing administrators and officers with tools to efficiently manage and resolve these complaints.

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)

### Backend Setup
1. Navigate to the backend directory: `cd samadhan-full/backend`
2. Install dependencies: `npm install`
3. Create a `.env` file in the backend root directory with the following content:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```
4. Start the backend server: `npm run dev`

### Frontend Setup
1. Navigate to the frontend directory: `cd samadhan-full/frontend`
2. Install dependencies: `npm install`
3. Create a `.env` file in the frontend root directory with the following content:
   ```
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_ENVIRONMENT=development
   ```
4. Start the frontend development server: `npm start`

## Production Deployment

### Frontend Production Build
- Run `npm run build` to create optimized production build
- Deploy the contents of the `build/` directory to a static hosting service

### Backend Production Deployment
- Use the production server configuration: `npm run start:prod`
- Set NODE_ENV to 'production' to enable production optimizations
- Configure reverse proxy with Nginx or Apache
- Use a process manager like PM2 for Node.js process management

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Complaints
- `POST /api/complaints` - Create a new complaint
- `GET /api/complaints` - Get all complaints (admin/officer) or user's complaints
- `GET /api/complaints/mine` - Get current user's complaints
- `GET /api/complaints/:id` - Get a specific complaint
- `PUT /api/complaints/:id` - Update a complaint
- `DELETE /api/complaints/:id` - Delete a complaint
- `PUT /api/complaints/:id/feedback` - Add feedback to a complaint

### Officers
- `GET /api/officers` - Get all officers
- `POST /api/officers` - Create a new officer
- `PUT /api/officers/:id` - Update an officer
- `DELETE /api/officers/:id` - Delete an officer
- `PUT /api/officers/:id/assign-complaint/:complaintId` - Assign a complaint to an officer

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get a specific user
- `PUT /api/admin/users/:id` - Update a user
- `DELETE /api/admin/users/:id` - Delete a user
- `GET /api/admin/reports/complaints` - Get complaint reports
- `GET /api/admin/stats/status-counts` - Get status counts
- `GET /api/admin/dashboard/stats` - Get admin dashboard stats

### File Uploads
- `POST /api/upload` - Upload files (images)

## Performance Optimizations

- Code splitting with React.lazy() and Suspense
- Skeleton screens for loading states
- Optimized image handling and compression
- Proper caching strategies
- Database query optimizations
- Bundle size optimization with tree-shaking

## Security Features

- JWT-based authentication with secure tokens
- Input validation and sanitization
- Rate limiting to prevent abuse
- CORS configuration for secure cross-origin requests
- Password hashing with bcrypt
- Secure session management

## Testing

- Unit tests with Jest
- Integration tests with React Testing Library
- Component testing for UI elements
- API endpoint testing

To run tests: `npm test`

## Architecture

The application follows modern React patterns:

- Context API for state management
- Custom hooks for reusable logic
- Component composition for flexibility
- Proper separation of concerns
- Clean, maintainable code structure

## Environment Variables

### Frontend
- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_ENVIRONMENT` - Environment (development/production)

### Backend
- `PORT` - Server port
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the ISC License.