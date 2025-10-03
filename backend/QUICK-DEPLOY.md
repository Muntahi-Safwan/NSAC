# Quick Deploy Guide - Backend with .env File Included

This guide shows you how to deploy the backend with the `.env` file baked into the Docker image for simplified deployment.

## ⚠️ Important Security Note

**The .env file is included in the Docker image for convenience.** This means:
- ✅ Quick and easy deployment
- ✅ No need to manage environment variables separately
- ⚠️ Secrets are stored in the image
- ⚠️ Anyone with access to the image can see your secrets
- ⚠️ Only use this for development/testing or secure private deployments

For production deployments with sensitive data, consider using AWS Secrets Manager instead.

## 🚀 Quick Deployment Steps

### Step 1: Prepare Your .env File

Make sure your `.env` file is in the backend directory with all required variables:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
GROQ_API_KEY=your-groq-api-key
NASA_API_KEY=your-nasa-api-key
```

### Step 2: Build the Docker Image

```bash
cd backend
docker build -t airquality-backend:latest .
```

### Step 3: Option A - Run Locally

```bash
docker run -d \
  --name airquality-backend \
  -p 3000:3000 \
  --restart unless-stopped \
  airquality-backend:latest
```

### Step 3: Option B - Deploy to AWS ECR + ECS

#### 1. Login to AWS ECR

```bash
export AWS_REGION=us-east-1
export AWS_ACCOUNT_ID=YOUR_ACCOUNT_ID

aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
```

#### 2. Tag and Push

```bash
# Tag the image
docker tag airquality-backend:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/airquality-backend:latest

# Push to ECR
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/airquality-backend:latest
```

#### 3. Update ECS Service (if already exists)

```bash
# Force new deployment with the updated image
aws ecs update-service \
  --cluster airquality-cluster \
  --service airquality-backend-service \
  --force-new-deployment \
  --region $AWS_REGION
```

### Step 3: Option C - Deploy to AWS App Runner

```bash
aws apprunner create-service \
  --service-name airquality-backend \
  --source-configuration '{
    "ImageRepository": {
      "ImageIdentifier": "'$AWS_ACCOUNT_ID'.dkr.ecr.'$AWS_REGION'.amazonaws.com/airquality-backend:latest",
      "ImageRepositoryType": "ECR",
      "ImageConfiguration": {
        "Port": "3000"
      }
    },
    "AutoDeploymentsEnabled": true
  }' \
  --instance-configuration '{
    "Cpu": "1 vCPU",
    "Memory": "2 GB"
  }' \
  --health-check-configuration '{
    "Protocol": "HTTP",
    "Path": "/health",
    "Interval": 10,
    "Timeout": 5,
    "HealthyThreshold": 1,
    "UnhealthyThreshold": 5
  }' \
  --region $AWS_REGION
```

## 🔄 Updating Environment Variables

When you need to change environment variables:

1. Update the `.env` file
2. Rebuild the Docker image
3. Push to ECR
4. Force new deployment

```bash
# One-liner to rebuild and redeploy
docker build -t airquality-backend:latest . && \
docker tag airquality-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/airquality-backend:latest && \
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/airquality-backend:latest && \
aws ecs update-service --cluster airquality-cluster --service airquality-backend-service --force-new-deployment --region $AWS_REGION
```

## 🧪 Testing

Test the health endpoints:

```bash
# Local
curl http://localhost:3000/health

# AWS (replace with your domain)
curl https://your-domain.com/health
```

## 📝 Complete Build & Deploy Script

Create a file `deploy.sh`:

```bash
#!/bin/bash
set -e

# Configuration
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="YOUR_ACCOUNT_ID"
ECR_REPO="airquality-backend"
ECS_CLUSTER="airquality-cluster"
ECS_SERVICE="airquality-backend-service"

echo "🏗️  Building Docker image..."
docker build -t $ECR_REPO:latest .

echo "🔐 Logging into AWS ECR..."
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

echo "🏷️  Tagging image..."
docker tag $ECR_REPO:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:latest

echo "⬆️  Pushing to ECR..."
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:latest

echo "🚀 Deploying to ECS..."
aws ecs update-service \
  --cluster $ECS_CLUSTER \
  --service $ECS_SERVICE \
  --force-new-deployment \
  --region $AWS_REGION

echo "✅ Deployment initiated! Monitor status with:"
echo "aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE --region $AWS_REGION"
```

Make it executable and run:

```bash
chmod +x deploy.sh
./deploy.sh
```

## 🎯 Minimal AWS Setup

If starting from scratch:

```bash
# 1. Create ECR repository
aws ecr create-repository --repository-name airquality-backend --region $AWS_REGION

# 2. Create ECS cluster
aws ecs create-cluster --cluster-name airquality-cluster --region $AWS_REGION

# 3. Build and push image (see steps above)

# 4. Create task definition (simplified - no secrets manager needed)
aws ecs register-task-definition --cli-input-json '{
  "family": "airquality-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [{
    "name": "airquality-backend",
    "image": "YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/airquality-backend:latest",
    "cpu": 512,
    "memory": 1024,
    "essential": true,
    "portMappings": [{
      "containerPort": 3000,
      "protocol": "tcp"
    }],
    "healthCheck": {
      "command": ["CMD-SHELL", "node -e \"require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})\""],
      "interval": 30,
      "timeout": 5,
      "retries": 3,
      "startPeriod": 60
    },
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/airquality-backend",
        "awslogs-region": "us-east-1",
        "awslogs-stream-prefix": "ecs"
      }
    }
  }]
}'

# 5. Create service
aws ecs create-service \
  --cluster airquality-cluster \
  --service-name airquality-backend-service \
  --task-definition airquality-backend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --region $AWS_REGION
```

## 🛠️ Troubleshooting

### Image builds but container won't start

Check if .env file is present:
```bash
docker run --rm airquality-backend:latest ls -la
```

### Environment variables not loading

Verify .env is in the image:
```bash
docker run --rm airquality-backend:latest cat .env
```

### Health check failing

Test locally first:
```bash
docker run -p 3000:3000 airquality-backend:latest
curl http://localhost:3000/health
```

## 📋 Checklist

- [ ] `.env` file exists in backend directory
- [ ] All required environment variables are set in `.env`
- [ ] Docker image builds successfully
- [ ] Health check passes locally
- [ ] Image pushed to ECR
- [ ] ECS service updated/created
- [ ] Application is accessible

## 🔒 Security Recommendations

For production deployments:

1. Use AWS Secrets Manager or Parameter Store
2. Remove `.env` from Dockerfile
3. Pass secrets via task definition
4. Rotate secrets regularly
5. Use IAM roles instead of hardcoded credentials
6. Enable encryption at rest for ECR

See `DEPLOYMENT.md` for the secure production deployment guide.
