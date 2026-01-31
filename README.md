# 🏠 Real Estate Management System

A modern, full-stack real estate management application built with **NestJS** (backend) and **Next.js** (frontend) using the latest best practices and technologies.

---

## 🚀 Quick Start

### One-Click Deployment

```bash
# For LOCAL development
./deploy.sh  # Select option 1

# For PRODUCTION server
./deploy.sh  # Select option 2
```

**That's it!** The script handles everything:
- ✅ Environment setup
- ✅ Database migrations
- ✅ Seeding (local only)
- ✅ Docker containers
- ✅ Service startup
- ✅ Health checks

### Access Points

**Local Development:**
- API: http://localhost:3000
- Admin Panel: http://localhost:3001 (login: `admin`/`admin123`)
- Public Website: http://localhost:3002

**Production:**
- See deployment output for your server's IP addresses

---

## 📚 Documentation

- **[DEPLOYMENT_MASTER_GUIDE.md](./DEPLOYMENT_MASTER_GUIDE.md)** - Complete deployment guide
- **[SEEDING_GUIDE.md](./SEEDING_GUIDE.md)** - Database seeding guide
- **[AI_PROJECT_CONTEXT.md](./AI_PROJECT_CONTEXT.md)** - AI coding instructions

---

## 🏗️ Architecture

### Backend (NestJS v10)
- **Framework**: NestJS 10 with TypeScript
- **Database**: PostgreSQL 16 with TypeORM
- **Authentication**: JWT with role-based access control
- **Validation**: class-validator and class-transformer
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS, Rate limiting
- **File Upload**: Multer for image management
- **Caching**: Redis 7 integration
- **AI Features**: Google Gemini chatbot

### Frontend (Next.js v15)
- **Framework**: Next.js 15 with App Router & React 19
- **Admin UI**: PrimeReact with modern components
- **Public UI**: Custom components with Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Data Tables**: TanStack Table (server-side pagination)
- **Forms**: React Hook Form with Zod validation
- **Internationalization**: next-intl (SR/EN)
- **Type Safety**: Full TypeScript integration

## 🚀 Features

### Property Management
- ✅ CRUD operations for properties
- ✅ Advanced search and filtering
- ✅ Image upload, crop, rotate, reorder
- ✅ Google Maps integration
- ✅ Multi-step wizard (Property → Client → Images → Location)
- ✅ Geolocation support
- ✅ Status tracking
- ✅ Bulk operations

### Client Management
- ✅ Client profiles and contact information
- ✅ Transaction type tracking
- ✅ Client-property relationships
- ✅ Communication history

### User Management
- ✅ Role-based access control (Admin/User)
- ✅ User profiles and permissions
- ✅ Authentication and authorization

### Modern Features
- ✅ Real-time updates
- ✅ Responsive design
- ✅ Dark/Light theme support
- ✅ Data export capabilities
- ✅ Audit logging
- ✅ Performance optimizations

## 📋 Prerequisites

- **Node.js** 18+ and npm 8+
- **PostgreSQL** 12+
- **Redis** (optional, for caching)

## 🛠️ Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd RealEstatesAPI-NestJS

# Run automated setup
./setup.sh
```

### 2. Configure Environment

Update `.env` file with your configuration:

```env
# Database Configuration
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
DB_NAME=estates
DB_SYNC=true

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRES_IN=7d

# Application Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001,http://localhost:3000
```

### 3. Database Setup

```bash
# Run migrations
npm run migration:run

# Seed initial data
npm run seed:all
```

### 4. Start Application

```bash
# Start both backend and frontend
./start.sh

# Or start individually:
npm run start:dev          # Backend only
cd admin-frontend && npm run dev  # Frontend only
```

## � Postman Integration

This project is **Postman-ready** with complete API collections and automated testing.

### Quick Start with Postman:
1. **Import the collection**: `postman/Real-Estate-API.postman_collection.json`
2. **Import the environment**: `postman/Real-Estate-Development.postman_environment.json`
3. **Start the API**: `npm run start:dev`
4. **Login**: Use the Authentication > Login request (token auto-saves)
5. **Test away**: All endpoints are ready with sample data

📚 **Detailed Guide**: See `postman/README.md` for complete testing workflows.

## �🔗 Application URLs

- **Backend API**: http://localhost:3000
- **Frontend Admin**: http://localhost:3001  
- **API Base URL**: http://localhost:3000/v1
- **Uploads**: http://localhost:3000/uploads

## 📦 Available Scripts

### Backend Scripts
```bash
npm run start:dev          # Start in development mode
npm run start:prod         # Start in production mode
npm run build              # Build for production
npm run test               # Run tests
npm run test:e2e           # Run e2e tests
npm run lint               # Lint code
npm run format             # Format code

# Database scripts
npm run migration:generate # Generate new migration
npm run migration:run      # Run migrations
npm run migration:revert   # Revert last migration
npm run seed:all          # Seed all data
npm run db:reset          # Reset database and reseed
```

### Frontend Scripts
```bash
cd admin-frontend
npm run dev               # Start development server
npm run build             # Build for production
npm run start             # Start production server
npm run lint              # Lint code
npm run type-check        # Check TypeScript types
```

## 🐳 Docker Support

### Development with Docker Compose

```bash
# Start all services (API, Admin, Database, Redis)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## 📁 Project Structure

```
RealEstatesAPI-NestJS/
├── src/                          # Backend source code
│   ├── auth/                     # Authentication module
│   ├── common/                   # Shared utilities and config
│   ├── entities/                 # Feature modules
│   │   ├── client/              # Client management
│   │   ├── property/            # Property management
│   │   ├── property-image/      # Image management
│   │   ├── upload/              # File upload handling
│   │   └── user/                # User management
│   └── migrations/              # Database migrations
├── admin-frontend/              # Frontend application
│   ├── src/
│   │   ├── app/                 # Next.js app router
│   │   ├── components/          # Reusable UI components
│   │   ├── services/            # API service layer
│   │   ├── providers/           # React context providers
│   │   └── lib/                 # Utility functions
├── seeds/                       # Database seeders
├── uploads/                     # File storage
├── docker-compose.yml           # Development containers
└── README.md                    # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `GET /auth/profile` - Get current user profile

### Properties
- `GET /v1/properties` - List properties with filtering
- `POST /v1/properties` - Create new property
- `GET /v1/properties/:id` - Get property details
- `PATCH /v1/properties/:id` - Update property
- `DELETE /v1/properties/:id` - Delete property

### Users
- `GET /v1/users` - List users
- `POST /v1/users` - Create user
- `PATCH /v1/users/:id` - Update user
- `DELETE /v1/users/:id` - Delete user

### File Upload
- `POST /v1/upload/single` - Upload single file
- `POST /v1/upload/multiple` - Upload multiple files

Full API documentation available at: http://localhost:3000/api/docs

## 🔒 Security Features

- **JWT Authentication** with refresh token support
- **Role-based Access Control** (RBAC)
- **Input validation** with class-validator
- **SQL injection protection** with TypeORM
- **XSS protection** with Helmet
- **CORS configuration** for cross-origin requests
- **Rate limiting** to prevent abuse
- **File upload security** with type validation

## 🎨 UI/UX Features

- **Responsive Design** - Works on all devices
- **Modern UI** - Clean, professional interface
- **Dark/Light Mode** - Theme switching support
- **Real-time Updates** - Live data synchronization
- **Advanced Search** - Powerful filtering options
- **Drag & Drop** - Intuitive file uploads
- **Toast Notifications** - User feedback system
- **Loading States** - Enhanced user experience

## 🧪 Testing

```bash
# Backend tests
npm run test                # Unit tests
npm run test:e2e           # End-to-end tests
npm run test:cov           # Coverage report

# Frontend tests
cd admin-frontend
npm run test               # Component tests
npm run test:e2e           # E2E tests with Playwright
```

## 📊 Performance

- **Lazy Loading** - Components and routes
- **Image Optimization** - Next.js Image component
- **Database Indexing** - Optimized queries
- **Caching** - Redis for frequently accessed data
- **Code Splitting** - Optimized bundle sizes
- **Tree Shaking** - Unused code elimination

## 🌍 Environment Support

- **Development** - Hot reload, debugging tools
- **Staging** - Production-like environment
- **Production** - Optimized performance, security

## 📈 Monitoring & Logging

- **Winston Logger** - Structured logging
- **Health Checks** - Application monitoring
- **Error Tracking** - Comprehensive error handling
- **Performance Metrics** - Response time tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Production Deployment

### Hetzner Cloud Deployment

Ready to deploy to production? Follow these comprehensive guides:

#### **Quick Start:**
1. 📋 **[HETZNER_SETUP_CHECKLIST.md](./HETZNER_SETUP_CHECKLIST.md)** - Complete server setup checklist
2. 🔐 **[SSH_QUICK_GUIDE.md](./documentation/SSH_QUICK_GUIDE.md)** - SSH key setup for Hetzner
3. ⚙️ **[HETZNER_SERVER_OPTIONS_EXPLAINED.md](./documentation/HETZNER_SERVER_OPTIONS_EXPLAINED.md)** - Server configuration guide
4. 🖥️ **[HETZNER_DEPLOYMENT_GUIDE.md](./documentation/HETZNER_DEPLOYMENT_GUIDE.md)** - Full deployment walkthrough
5. 🚀 **[PRODUCTION_QUICK_START.md](./documentation/PRODUCTION_QUICK_START.md)** - Start applications on server
6. 🤖 **[AUTOMATED_DEPLOYMENT_GUIDE.md](./documentation/AUTOMATED_DEPLOYMENT_GUIDE.md)** - CI/CD automation setup

#### **Recommended Server:**
- **Type:** CPX22 (Regular Performance)
- **Specs:** 2 vCPUs, 4GB RAM, 80GB SSD
- **Cost:** €5.99/mo (or €7.19/mo with backups)
- **Perfect for:** NestJS API + 2x Next.js frontends + PostgreSQL + Redis

#### **Quick Deploy Steps:**
```bash
# 1. Create Hetzner server (see checklist above)
# 2. SSH into server
ssh root@YOUR_SERVER_IP

# 3. Run automated setup
curl -fsSL https://get.docker.com | sh
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs docker-compose-plugin git

# 4. Clone and deploy
git clone <your-repo-url>
cd RealEstatesAPI-NestJS
# Follow HETZNER_DEPLOYMENT_GUIDE.md for complete steps
```

See **[Complete Deployment Documentation](./documentation/)** for detailed guides.

---

## 🆘 Support

For support and questions:

- 📧 Email: support@realestate-app.com
- 📚 Documentation: [API Docs](http://localhost:3000/api/docs)
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 🚀 Deployment Help: See `documentation/` folder

---

**Built with ❤️ using modern web technologies**
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
