#!/bin/bash
set -e

# Log everything
exec > /var/log/user-data.log 2>&1

echo "===== UserData starting ====="
echo "IMAGE_TAG provided: __IMAGE_TAG__"

export IMAGE_TAG="__IMAGE_TAG__"
echo "IMAGE_TAG=$IMAGE_TAG" >> /etc/environment

yum update -y

# Install and enable chrony for NTP sync
yum install -y chrony
systemctl enable chronyd
systemctl start chronyd

chronyc waitsync 30
chronyc tracking
date

# Install docker
amazon-linux-extras install docker -y
systemctl enable docker
systemctl start docker

# Install docker-compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Login to ECR
aws ecr get-login-password --region us-east-2 \
  | docker login --username AWS --password-stdin 076301327489.dkr.ecr.us-east-2.amazonaws.com

# Download docker-compose.yml from S3
mkdir -p /opt/needymeds
aws s3 cp s3://needymeds-infra-config/compose/production/docker-compose.yml \
  /opt/needymeds/docker-compose.yml

cd /opt/needymeds

echo "Running docker-compose pull with IMAGE_TAG=$IMAGE_TAG"
docker-compose --env-file /etc/environment pull

echo "Starting container"
docker-compose --env-file /etc/environment up -d

systemctl enable docker

echo "===== UserData completed ====="
