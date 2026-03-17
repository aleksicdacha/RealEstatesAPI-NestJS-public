# 📮 Postman Testing Guide for Real Estate API

## 🚀 Quick Setup

### 1. Import Collection & Environment

1. **Import Collection:**
   - Open Postman
   - Click "Import" button
   - Select `postman/Real-Estate-API.postman_collection.json`

2. **Import Environment:**
   - Click "Import" button again  
   - Select `postman/Real-Estate-Development.postman_environment.json`
   - Select the "Real Estate API - Development" environment in top-right dropdown

### 2. Start the API Server

```bash
# From project root
npm run start:dev
```

Server should start on `http://localhost:3000`

## 🔐 Authentication Workflow

### Step 1: Login
1. Go to `Authentication > Login`
2. Execute the request with default credentials:
   ```json
   {
     "username": "admin",
     "password": "admin123" 
   }
   ```
3. **The access token is automatically saved** to environment variables
4. All subsequent requests will use this token automatically

### Step 2: Test Authentication
1. Go to `Authentication > Get Profile`
2. Execute to verify your token works

## 🏠 Testing Properties

### Create Property Flow:
1. **Authentication > Login** (get token)
2. **Properties > Create Property** (creates property, saves ID)
3. **Properties > Get Property by ID** (view created property)
4. **Properties > Update Property** (modify property)
5. **Properties > Get All Properties** (list with filters)
6. **Properties > Delete Property** (cleanup)

### Property Search & Filter:
Use query parameters in "Get All Properties":
- `page=1&limit=10` - Pagination
- `sortBy=createdAt&order=DESC` - Sorting
- `searchField=address&searchValue=New York` - Search
- `status=Active` - Filter by status
- `propertyType=Apartment` - Filter by type

## 👥 Testing Clients

### Client Management Flow:
1. **Clients > Create Client** (creates client, saves ID)
2. **Clients > Get Client by ID** (view details)
3. **Clients > Update Client** (modify info)
4. **Clients > Get All Clients** (list all)
5. **Clients > Delete Client** (soft delete)

## 👤 Testing Users (Admin Only)

### User Management:
1. **Users > Get All Users** (list users)
2. **Users > Create User** (create new user)

## 📁 Testing File Uploads

### Upload Images:
1. **File Upload > Upload Single File**
   - Select a single image file
   - Returns file URL for use in properties

2. **File Upload > Upload Multiple Files**
   - Select multiple image files
   - Returns array of file URLs

### Using Uploaded Images in Properties:
After uploading, copy the returned URLs and use them in the property creation:
```json
{
  "images": [
    "http://localhost:3000/uploads/filename1.jpg",
    "http://localhost:3000/uploads/filename2.jpg"
  ]
}
```

## 🧪 Test Scenarios

### Scenario 1: Complete Property Listing
1. Login as admin
2. Create a client (buyer)
3. Upload property images
4. Create property with uploaded images
5. Associate property with client
6. Search for properties by location
7. Update property status

### Scenario 2: User Management
1. Login as admin
2. Create new user account
3. Test different role permissions
4. Update user information

### Scenario 3: Error Handling
1. Try accessing protected endpoints without token
2. Send invalid data formats
3. Test validation errors
4. Test not found scenarios

## 🔧 Environment Variables

The environment automatically manages:
- `baseUrl` - API base URL
- `access_token` - JWT token (auto-saved on login)
- `property_id` - Last created property ID
- `client_id` - Last created client ID
- `user_id` - Last created user ID

## 📊 Response Formats

### Success Response:
```json
{
  "data": { /* entity data */ },
  "message": "Success message",
  "statusCode": 200
}
```

### Paginated Response:
```json
{
  "items": [ /* array of entities */ ],
  "total": 25,
  "page": 1, 
  "limit": 10,
  "totalPages": 3
}
```

### Error Response:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

## 🛠️ Troubleshooting

### Common Issues:

1. **401 Unauthorized**
   - Run the Login request first
   - Check if token is saved in environment

2. **422 Validation Error**
   - Check request body format
   - Ensure required fields are provided
   - Verify data types match API expectations

3. **404 Not Found**
   - Verify the entity ID exists
   - Check if endpoint URL is correct

4. **500 Internal Server Error**
   - Check server logs
   - Verify database connection
   - Ensure all required services are running

### Debug Tips:
- Check Postman Console for detailed logs
- Use environment variable previews
- Enable "Follow redirects" in settings
- Check request/response in Postman console

## 🔄 API Versioning

All endpoints use `/v1/` prefix:
- Properties: `/v1/properties`
- Clients: `/v1/clients`  
- Users: `/v1/users`
- Auth: `/v1/auth`
- Upload: `/v1/upload`

## 📈 Performance Testing

Use Postman's Collection Runner for:
- Load testing with multiple iterations
- Automated test sequences
- Performance benchmarking
- Data seeding

Enjoy testing your Real Estate API! 🏡
