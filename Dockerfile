# Dockerfile
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# 의존성 파일 복사
COPY package.json pnpm-lock.yaml ./

# pnpm 설치
RUN npm install -g pnpm

# 의존성 설치
RUN pnpm install --frozen-lockfile

# 소스 코드 복사
COPY . .

# 애플리케이션 포트 (필요 시)
# EXPOSE 8080

# 환경 변수 파일 복사 (옵션)
# COPY .env .env

# 애플리케이션 실행
CMD ["pnpm", "start"]
