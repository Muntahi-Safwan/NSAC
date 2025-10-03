#!/bin/bash

# Simple One-Click Deployment Script
# Builds Docker image with .env file and deploys to AWS

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Air Quality Backend - Quick Deploy${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo -e "${YELLOW}Please create a .env file with your configuration${NC}"
    exit 1
fi

# Configuration - UPDATE THESE
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID}"
ECR_REPOSITORY="${ECR_REPOSITORY:-airquality-backend}"
ECS_CLUSTER="${ECS_CLUSTER:-airquality-cluster}"
ECS_SERVICE="${ECS_SERVICE:-airquality-backend-service}"

# Check if AWS credentials are configured
if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo -e "${YELLOW}⚠️  AWS_ACCOUNT_ID not set${NC}"
    echo -e "Please set it: export AWS_ACCOUNT_ID=your-account-id"
    echo -e "Or update this script with your AWS Account ID"
    exit 1
fi

# Step 1: Build Docker image
echo -e "\n${GREEN}[1/5] 🏗️  Building Docker image...${NC}"
docker build -t $ECR_REPOSITORY:latest .
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Image built successfully${NC}"

# Step 2: Login to AWS ECR
echo -e "\n${GREEN}[2/5] 🔐 Logging into AWS ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin \
    $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ ECR login failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Logged in to ECR${NC}"

# Step 3: Tag image
echo -e "\n${GREEN}[3/5] 🏷️  Tagging image...${NC}"
IMAGE_TAG=$(date +%Y%m%d%H%M%S)
docker tag $ECR_REPOSITORY:latest \
    $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest
docker tag $ECR_REPOSITORY:latest \
    $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$IMAGE_TAG
echo -e "${GREEN}✅ Tagged as: latest and $IMAGE_TAG${NC}"

# Step 4: Push to ECR
echo -e "\n${GREEN}[4/5] ⬆️  Pushing to ECR...${NC}"
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$IMAGE_TAG
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Push to ECR failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Pushed to ECR${NC}"

# Step 5: Deploy to ECS
echo -e "\n${GREEN}[5/5] 🚀 Deploying to ECS...${NC}"
aws ecs update-service \
    --cluster $ECS_CLUSTER \
    --service $ECS_SERVICE \
    --force-new-deployment \
    --region $AWS_REGION > /dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  ECS service update failed or service doesn't exist${NC}"
    echo -e "${YELLOW}If this is your first deployment, you need to create the ECS service first${NC}"
    echo -e "${YELLOW}See QUICK-DEPLOY.md for instructions${NC}"
else
    echo -e "${GREEN}✅ Deployment initiated${NC}"
fi

# Summary
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}  Deployment Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Docker image built and pushed${NC}"
echo -e "   Repository: ${BLUE}$ECR_REPOSITORY${NC}"
echo -e "   Tags: ${BLUE}latest, $IMAGE_TAG${NC}"
echo -e "   Region: ${BLUE}$AWS_REGION${NC}"

if aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE --region $AWS_REGION > /dev/null 2>&1; then
    echo -e "\n${GREEN}📊 Monitoring deployment...${NC}"
    echo -e "Run this command to check status:"
    echo -e "${BLUE}aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE --region $AWS_REGION --query 'services[0].deployments'${NC}"

    # Wait a moment and check service status
    sleep 5
    RUNNING_COUNT=$(aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE --region $AWS_REGION --query 'services[0].runningCount' --output text)
    DESIRED_COUNT=$(aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE --region $AWS_REGION --query 'services[0].desiredCount' --output text)

    echo -e "\n${BLUE}Service Status:${NC}"
    echo -e "   Running tasks: ${GREEN}$RUNNING_COUNT${NC} / ${GREEN}$DESIRED_COUNT${NC}"
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete! 🎉${NC}"
echo -e "${GREEN}========================================${NC}"

# Show next steps
echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "1. Check application logs in CloudWatch"
echo -e "2. Test the health endpoint: ${BLUE}curl https://your-domain.com/health${NC}"
echo -e "3. Monitor ECS service in AWS Console"
