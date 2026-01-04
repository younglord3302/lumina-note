# 🚀 Deployment Guide

This guide covers different deployment strategies for the Notes App.

## Table of Contents

- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Environment Configuration](#environment-configuration)
- [Monitoring & Maintenance](#monitoring--maintenance)

## Local Development

### Prerequisites

- Node.js 16+
- MongoDB (local or cloud)
- npm or yarn

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/notes-app.git
cd notes-app

# Install dependencies
npm run install:all

# Set up environment
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB connection

# Start development servers
npm run dev
```

## Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker Deployment

```bash
# Build images
docker build -t notes-app-backend ./backend
docker build -t notes-app-frontend ./frontend

# Run containers
docker run -d -p 5000:5000 --name backend notes-app-backend
docker run -d -p 5173:80 --name frontend notes-app-frontend
```

### Using the Deployment Script

```bash
# Make script executable
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh
```

## Cloud Deployment

### Heroku

1. **Create Heroku apps**
   ```bash
   heroku create notes-app-backend
   heroku create notes-app-frontend
   ```

2. **Set environment variables**
   ```bash
   heroku config:set NODE_ENV=production -a notes-app-backend
   heroku config:set MONGODB_URI=your_mongodb_uri -a notes-app-backend
   ```

3. **Deploy**
   ```bash
   # Backend
   cd backend
   heroku git:remote -a notes-app-backend
   git push heroku main

   # Frontend (static)
   cd ../frontend
   npm run build
   # Serve dist/ folder with your static hosting
   ```

### Railway

1. **Connect GitHub repository**
2. **Add environment variables** in Railway dashboard
3. **Deploy automatically** on push to main branch

### Vercel + Railway

- **Frontend**: Deploy to Vercel (automatic deployments)
- **Backend**: Deploy to Railway or Heroku

### AWS

#### EC2 + Docker

```bash
# On EC2 instance
sudo yum update -y
sudo yum install -y docker git
sudo service docker start
sudo usermod -a -G docker ec2-user

# Clone and deploy
git clone https://github.com/yourusername/notes-app.git
cd notes-app
docker-compose up -d
```

#### ECS (Elastic Container Service)

```yaml
# Task definition example
{
  "family": "notes-app",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "your-registry/notes-app-backend:latest",
      "portMappings": [{ "containerPort": 5000 }]
    },
    {
      "name": "frontend",
      "image": "your-registry/notes-app-frontend:latest",
      "portMappings": [{ "containerPort": 80 }]
    }
  ]
}
```

### DigitalOcean App Platform

1. **Connect repository**
2. **Configure services**:
   - Backend: Node.js service on port 5000
   - Frontend: Static site from dist/
   - Database: MongoDB managed database
3. **Set environment variables**
4. **Deploy**

## Environment Configuration

### Required Environment Variables

#### Backend (.env)

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/notes-app
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=https://yourdomain.com
```

#### Frontend

For production, update the API base URL in `src/services/api.ts`:

```typescript
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-api-domain.com'
  : 'http://localhost:5000';
```

## Monitoring & Maintenance

### Health Checks

The application includes health check endpoints:

- Backend: `GET /health`
- Frontend: `GET /health`

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Database Backup

```bash
# MongoDB backup
docker exec -it notes-app-mongodb mongodump --db notes-app --out /backup

# Copy backup to host
docker cp notes-app-mongodb:/backup ./backup
```

### Scaling

#### Horizontal Scaling (Backend)

```yaml
# docker-compose.scale.yml
version: '3.8'
services:
  backend:
    scale: 3
    # Add load balancer
```

#### Database Scaling

- Use MongoDB Atlas for cloud scaling
- Implement read replicas for high availability
- Use sharding for large datasets

## Security Checklist

- [ ] Change default passwords
- [ ] Use HTTPS in production
- [ ] Set secure JWT secrets
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities

## Performance Optimization

### Frontend

- Enable gzip compression
- Optimize bundle size
- Use CDN for static assets
- Implement code splitting
- Enable service worker for caching

### Backend

- Use connection pooling for database
- Implement caching (Redis)
- Enable gzip compression
- Use PM2 for process management
- Set appropriate timeouts

### Database

- Create proper indexes
- Use connection pooling
- Implement query optimization
- Regular maintenance tasks
- Monitor slow queries

## Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check what's using ports
   lsof -i :5000
   lsof -i :5173

   # Kill process
   kill -9 <PID>
   ```

2. **Database connection issues**
   ```bash
   # Test MongoDB connection
   docker exec -it notes-app-mongodb mongo --eval "db.stats()"
   ```

3. **Build failures**
   ```bash
   # Clear Docker cache
   docker system prune -a

   # Rebuild without cache
   docker-compose build --no-cache
   ```

### Support

For additional help:
- Check the [GitHub Issues](https://github.com/yourusername/notes-app/issues)
- Review the [README](README.md)
- Contact the maintainers

---

Happy deploying! 🎉
