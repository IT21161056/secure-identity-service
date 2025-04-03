@echo off
REM Docker build and run script
call secrets.bat

echo Building Docker image...
docker build -t identity-service .

echo Starting container...
docker run -d -p 5000:5000 ^
  -e MONGO_URL="%MONGO_URL%" ^
  -e JWT_SECRET="%JWT_SECRET%" ^
  -e ACCESS_TOKEN_SECRET="%ACCESS_TOKEN_SECRET%" ^
  -e REFRESH_TOKEN_SECRET="%REFRESH_TOKEN_SECRET%" ^
  identity-service

echo Container started on port 5000