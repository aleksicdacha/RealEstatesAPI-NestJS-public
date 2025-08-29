# Real Estate API - Complete Setup Guide

## 🚀 Quick Start Commands

### Option 1: Automated Setup (Recommended)
```bash
# Make setup script executable and run
chmod +x setup.sh
./setup.sh

# Start the application
chmod +x start.sh
./start.sh
```

### Option 2: Manual Setup

#### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 12+
- Docker and Docker Compose (optional)

#### 1. Backend Setup
```bash
# Install backend dependencies
cd /home/dalibor/Projects/RealEstatesAPI-NestJS
npm install

# Database setup (if not using Docker)
# Create PostgreSQL database: 'real_estate_db'
# Update src/common/config/environments/.env.development with your DB credentials

# Run database migrations
npm run migration:run

# Seed initial data
npm run seed

# Start backend in development mode
npm run start:dev
```

#### 2. Frontend Setup
```bash
# Install frontend dependencies
cd admin-frontend
npm install

# Start frontend in development mode
npm run dev
```

#### 3. Docker Setup (Alternative)
```bash
# Start with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f
```

## 📊 Application URLs

- **Backend API**: http://localhost:3000
- **Frontend Admin Panel**: http://localhost:3001
- **API Documentation**: Use Postman collection (see below)

## 🔧 API Testing with Postman

### Import Postman Collection
1. Open Postman
2. Click "Import" → "File"
3. Select `postman/Real-Estate-API.postman_collection.json`
4. Import environment: `postman/Real-Estate-Development.postman_environment.json`

### Authentication Flow
1. Use "Auth → Login" request to get JWT token
2. Token is automatically set in environment variables
3. All other requests use the token automatically

### Available Endpoints
- **Authentication**: Login, logout, profile
- **Users**: CRUD operations, role management
- **Properties**: CRUD, search, filtering
- **Clients**: CRUD operations
- **File Upload**: Property images

## 🗂️ Project Structure

### Backend (`/src`)
- `auth/` - JWT authentication, guards, strategies
- `entities/` - Business logic modules (User, Property, Client)
- `common/` - Shared utilities, config, validators
- `migrations/` - Database migrations

### Frontend (`/admin-frontend`)
- `src/app/` - Next.js pages and components
- `src/app/components/` - Reusable UI components
- `src/app/utils/` - Utilities and API helpers

## 🛠️ Development Commands

### Backend
```bash
npm run start:dev     # Development mode with hot reload
npm run start:debug   # Debug mode
npm run build         # Production build
npm run test          # Run tests
npm run test:e2e      # End-to-end tests
npm run migration:generate -- MigrationName  # Generate migration
npm run migration:run # Run migrations
npm run seed          # Seed database
```

### Frontend
```bash
npm run dev           # Development mode
npm run build         # Production build
npm run start         # Start production build
npm run lint          # Run ESLint
npm run type-check    # TypeScript check
```

## 🔑 Default Credentials

### Super Admin
- **Username**: `admin`
- **Password**: `admin123`

### Test Users
- **Username**: `user1`
- **Password**: `password123`

## 🌐 Environment Configuration

### Backend Environment (.env.development)
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_DATABASE=real_estate_db
JWT_SECRET=your-super-secret-jwt-key-here
UPLOAD_PATH=./uploads
```

### Frontend Environment (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 📚 Technology Stack

### Backend
- **Framework**: NestJS 10.4.15
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with role-based access
- **Validation**: class-validator, class-transformer
- **File Upload**: Multer

### Frontend
- **Framework**: Next.js 15.4.6
- **UI Library**: PrimeReact 10.9.6
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios

## 🔍 Key Features

- **Authentication & Authorization**: JWT-based with role management
- **Property Management**: CRUD operations with image upload
- **Client Management**: Client information and relationships
- **User Management**: Admin panel for user administration
- **Search & Filtering**: Advanced property search capabilities
- **Responsive Design**: Mobile-friendly admin interface
- **API Testing**: Comprehensive Postman collection

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   
   # Kill process on port 3001
   lsof -ti:3001 | xargs kill -9
   ```

2. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check database credentials in environment file
   - Verify database exists

3. **Module Not Found Errors**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Migration Errors**
   ```bash
   # Drop and recreate database, then run migrations
   npm run migration:run
   ```

## 📞 Support

For issues or questions, check:
1. Console logs for error messages
2. Database connection and permissions
3. Environment variable configuration
4. Port availability

Happy coding! 🎉
