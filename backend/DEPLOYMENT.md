# Air Quality Backend - AWS Deployment Guide

This guide will help you deploy the Air Quality Backend API to AWS using Docker containers.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Local Testing with Docker](#local-testing-with-docker)
- [AWS Deployment](#aws-deployment)
- [Deployment Options](#deployment-options)
- [Environment Variables](#environment-variables)
- [Health Checks](#health-checks)
- [Monitoring and Logs](#monitoring-and-logs)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### Required Tools

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **AWS CLI**: Version 2.x
- **Node.js**: Version 20.x (for local development)
- **jq**: JSON processor (for deployment script)

### AWS Requirements

- AWS Account with appropriate permissions
- AWS CLI configured with credentials
- IAM roles for ECS Task Execution

## 🐳 Local Testing with Docker

### 1. Build the Docker Image

```bash
cd backend
docker build -t airquality-backend .
```

### 2. Run with Docker Compose

```bash
# Create .env file with your environment variables
cp .env.example .env

# Start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

### 3. Test Health Endpoints

```bash
# Health check
curl http://localhost:3000/health

# Readiness check
curl http://localhost:3000/ready

# Liveness check
curl http://localhost:3000/live
```

## ☁️ AWS Deployment

### Deployment Option 1: AWS ECS with Fargate (Recommended)

#### Step 1: Set Up AWS ECR Repository

```bash
# Set your AWS region
export AWS_REGION=us-east-1
export AWS_ACCOUNT_ID=YOUR_ACCOUNT_ID

# Create ECR repository
aws ecr create-repository \
  --repository-name airquality-backend \
  --region $AWS_REGION
```

#### Step 2: Push Docker Image to ECR

```bash
# Login to ECR
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build and tag image
docker build -t airquality-backend .
docker tag airquality-backend:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/airquality-backend:latest

# Push to ECR
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/airquality-backend:latest
```

#### Step 3: Create ECS Cluster

```bash
aws ecs create-cluster \
  --cluster-name airquality-cluster \
  --region $AWS_REGION
```

#### Step 4: Store Secrets in AWS Secrets Manager

```bash
# MongoDB URI
aws secretsmanager create-secret \
  --name airquality/mongodb-uri \
  --secret-string "your-mongodb-connection-string" \
  --region $AWS_REGION

# JWT Secret
aws secretsmanager create-secret \
  --name airquality/jwt-secret \
  --secret-string "your-jwt-secret" \
  --region $AWS_REGION

# GROQ API Key
aws secretsmanager create-secret \
  --name airquality/groq-api-key \
  --secret-string "your-groq-api-key" \
  --region $AWS_REGION

# NASA API Key
aws secretsmanager create-secret \
  --name airquality/nasa-api-key \
  --secret-string "your-nasa-api-key" \
  --region $AWS_REGION
```

#### Step 5: Create IAM Roles

**ECS Task Execution Role** (`ecsTaskExecutionRole`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "*"
    }
  ]
}
```

#### Step 6: Update Task Definition

1. Edit `aws-task-definition.json`
2. Update the following placeholders:
   - `YOUR_ACCOUNT_ID`
   - `YOUR_ECR_REPOSITORY_URI`
   - `REGION`
3. Register the task definition:

```bash
aws ecs register-task-definition \
  --cli-input-json file://aws-task-definition.json \
  --region $AWS_REGION
```

#### Step 7: Create ECS Service

```bash
aws ecs create-service \
  --cluster airquality-cluster \
  --service-name airquality-backend-service \
  --task-definition airquality-backend \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx,subnet-yyyyy],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=airquality-backend,containerPort=3000" \
  --region $AWS_REGION
```

#### Step 8: Set Up Application Load Balancer (ALB)

1. Create an ALB in the AWS Console or via CLI
2. Create a target group with health check path: `/health`
3. Configure listener rules to forward traffic to the target group
4. Update security groups to allow traffic on port 3000

### Deployment Option 2: Automated Deployment Script

#### 1. Make the deployment script executable

```bash
chmod +x deploy-to-aws.sh
```

#### 2. Update configuration in `deploy-to-aws.sh`

```bash
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="123456789012"
ECR_REPOSITORY="airquality-backend"
ECS_CLUSTER="airquality-cluster"
ECS_SERVICE="airquality-backend-service"
TASK_DEFINITION_FAMILY="airquality-backend"
```

#### 3. Run the deployment

```bash
./deploy-to-aws.sh
```

### Deployment Option 3: AWS App Runner

AWS App Runner is a simpler option for containerized applications:

```bash
# Create App Runner service
aws apprunner create-service \
  --service-name airquality-backend \
  --source-configuration '{
    "ImageRepository": {
      "ImageIdentifier": "'$AWS_ACCOUNT_ID'.dkr.ecr.'$AWS_REGION'.amazonaws.com/airquality-backend:latest",
      "ImageRepositoryType": "ECR",
      "ImageConfiguration": {
        "Port": "3000",
        "RuntimeEnvironmentVariables": {
          "NODE_ENV": "production"
        }
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

## 🔐 Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
NODE_ENV=production
PORT=3000
APP_VERSION=1.0.0

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/airquality

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this

# API Keys
GROQ_API_KEY=your-groq-api-key
NASA_API_KEY=your-nasa-api-key

# Optional: Logging
LOG_LEVEL=info
```

## 🏥 Health Checks

The application provides three health check endpoints:

### 1. `/health` - Comprehensive Health Check

Returns detailed server health information including:
- Uptime
- Memory usage
- Environment
- Version

```bash
curl http://your-domain.com/health
```

Response:
```json
{
  "uptime": 123.45,
  "message": "OK",
  "timestamp": 1234567890,
  "status": "healthy",
  "environment": "production",
  "version": "1.0.0",
  "memoryUsage": {
    "rss": "50.25 MB",
    "heapTotal": "30.5 MB",
    "heapUsed": "25.75 MB"
  }
}
```

### 2. `/ready` - Readiness Probe

Indicates if the application is ready to accept traffic:

```bash
curl http://your-domain.com/ready
```

### 3. `/live` - Liveness Probe

Indicates if the application is running:

```bash
curl http://your-domain.com/live
```

## 📊 Monitoring and Logs

### CloudWatch Logs

View logs in AWS CloudWatch:

```bash
aws logs tail /ecs/airquality-backend --follow --region $AWS_REGION
```

### Container Insights

Enable Container Insights for detailed metrics:

```bash
aws ecs update-cluster-settings \
  --cluster airquality-cluster \
  --settings name=containerInsights,value=enabled \
  --region $AWS_REGION
```

### Metrics to Monitor

- CPU utilization
- Memory utilization
- Request count
- Response time
- Error rate
- Health check status

## 🔍 Troubleshooting

### Container won't start

1. Check logs:
   ```bash
   docker logs airquality-backend
   ```

2. Verify environment variables:
   ```bash
   docker exec airquality-backend env
   ```

### Health check failing

1. Test locally:
   ```bash
   curl http://localhost:3000/health
   ```

2. Check container logs for errors

3. Verify port mapping: Container port 3000 should be exposed

### ECS Task failing

1. Check CloudWatch logs
2. Verify IAM roles have correct permissions
3. Ensure secrets are properly configured in Secrets Manager
4. Check security group rules

### Out of Memory

1. Increase memory allocation in task definition
2. Monitor memory usage trends
3. Check for memory leaks in application

## 🚀 Production Checklist

- [ ] Environment variables configured in AWS Secrets Manager
- [ ] IAM roles created with appropriate permissions
- [ ] ALB health checks configured for `/health` endpoint
- [ ] Auto-scaling policies configured
- [ ] CloudWatch alarms set up
- [ ] Backup and disaster recovery plan in place
- [ ] SSL/TLS certificate configured on ALB
- [ ] Security groups properly configured
- [ ] Monitoring and alerting enabled
- [ ] Log retention policies configured

## 📚 Additional Resources

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/)
- [Node.js in Production](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

## 🆘 Support

For issues or questions:
- Check application logs in CloudWatch
- Review ECS service events
- Contact the development team

## 📝 Version History

- **1.0.0** - Initial deployment configuration with health checks and container support
