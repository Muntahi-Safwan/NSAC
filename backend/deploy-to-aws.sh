#!/bin/bash

# AWS Deployment Script for Air Quality Backend
# This script builds, tags, and pushes the Docker image to AWS ECR, then updates ECS service

set -e

# Configuration - UPDATE THESE VALUES
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="YOUR_ACCOUNT_ID"
ECR_REPOSITORY="airquality-backend"
ECS_CLUSTER="airquality-cluster"
ECS_SERVICE="airquality-backend-service"
TASK_DEFINITION_FAMILY="airquality-backend"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  AWS Deployment Script${NC}"
echo -e "${BLUE}======================================${NC}"

# Step 1: Login to AWS ECR
echo -e "\n${GREEN}[1/6] Logging in to AWS ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Step 2: Build Docker image
echo -e "\n${GREEN}[2/6] Building Docker image...${NC}"
docker build -t $ECR_REPOSITORY:latest .

# Step 3: Tag Docker image
echo -e "\n${GREEN}[3/6] Tagging Docker image...${NC}"
IMAGE_TAG=$(date +%Y%m%d%H%M%S)
docker tag $ECR_REPOSITORY:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest
docker tag $ECR_REPOSITORY:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$IMAGE_TAG

# Step 4: Push to ECR
echo -e "\n${GREEN}[4/6] Pushing images to ECR...${NC}"
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$IMAGE_TAG

# Step 5: Update task definition
echo -e "\n${GREEN}[5/6] Updating ECS task definition...${NC}"
TASK_DEFINITION=$(aws ecs describe-task-definition --task-definition $TASK_DEFINITION_FAMILY --region $AWS_REGION)
NEW_TASK_DEF=$(echo $TASK_DEFINITION | jq --arg IMAGE "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest" '.taskDefinition | .containerDefinitions[0].image = $IMAGE | del(.taskDefinitionArn) | del(.revision) | del(.status) | del(.requiresAttributes) | del(.compatibilities) | del(.registeredAt) | del(.registeredBy)')
NEW_TASK_INFO=$(aws ecs register-task-definition --region $AWS_REGION --cli-input-json "$NEW_TASK_DEF")
NEW_REVISION=$(echo $NEW_TASK_INFO | jq '.taskDefinition.revision')

# Step 6: Update ECS service
echo -e "\n${GREEN}[6/6] Updating ECS service...${NC}"
aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE --task-definition $TASK_DEFINITION_FAMILY:$NEW_REVISION --region $AWS_REGION

echo -e "\n${GREEN}======================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}======================================${NC}"
echo -e "Image Tag: ${BLUE}$IMAGE_TAG${NC}"
echo -e "Task Definition Revision: ${BLUE}$NEW_REVISION${NC}"
echo -e "\nMonitor deployment status:"
echo -e "${BLUE}aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE --region $AWS_REGION${NC}"
