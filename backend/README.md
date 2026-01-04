# 📝 Notes App - Backend

Express.js API server for the Notes application with MongoDB integration and real-time sync capabilities.

## 🚀 Features

- **RESTful API**: Complete CRUD operations for notes
- **MongoDB Integration**: Document-based storage with Mongoose
- **Real-time Sync**: WebSocket support for live updates
- **Authentication**: JWT-based user authentication
- **File Storage**: Local file storage with cloud storage support
- **Error Handling**: Comprehensive error handling and logging

## 🛠️ Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Configure your `.env` file:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/notes-app
   JWT_SECRET=your-super-secret-jwt-key
   ```

3. **Start the server**
   ```bash
   npm run dev  # Development with nodemon
   npm start    # Production
   ```

## 📚 API Endpoints

### Notes

- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create a new note
- `GET /api/notes/:id` - Get a specific note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

## 🗄️ Database Schema

### Note Model
```javascript
{
  id: String,
  title: String,
  content: String,
  isDraft: Boolean,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date,
  userId: ObjectId,
  syncStatus: String
}
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start with nodemon (auto-restart on changes)
- `npm start` - Start production server
- `npm run build` - Build for production (if needed)

### Project Structure

```
backend/
├── models/          # MongoDB schemas
├── routes/          # API route handlers
├── middleware/      # Express middleware
├── controllers/     # Business logic
├── services/        # External services
├── utils/           # Helper functions
├── index.js         # Server entry point
└── package.json     # Dependencies
```

## 🚀 Deployment

### Environment Variables

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/notes-app
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=https://yourdomain.com
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🔒 Security

- JWT authentication with expiration
- CORS protection
- Input validation and sanitization
- Rate limiting
- Helmet.js for security headers

## 📊 Monitoring

The API includes:
- Request logging with Morgan
- Error tracking and reporting
- Performance monitoring
- Health check endpoints

## 🤝 Contributing

1. Follow the existing code style
2. Write tests for new features
3. Update documentation
4. Create meaningful commit messages
