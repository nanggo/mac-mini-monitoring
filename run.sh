#!/usr/bin/env zsh

# 최신 소스 받기
git pull origin main

# 도커 빌드 (캐시 무시)
docker-compose build --no-cache

# 도커 컨테이너 재시작
docker-compose down
docker-compose up -d