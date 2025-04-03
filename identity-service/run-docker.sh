#!/bin/bash
# Secure Docker build+run script using .env file

# ---------------------------
# 1. VALIDATE REQUIREMENTS
# ---------------------------
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker not found. Please install Docker first."
    exit 1
fi

if [ ! -f .env ]; then
    echo "ERROR: .env file not found in current directory."
    exit 1
fi

# ---------------------------
# 2. LOAD ENVIRONMENT VARIABLES
# ---------------------------
# Load only specific variables (security best practice)
required_vars=(
    MONGO_URL
    JWT_SECRET
    ACCESS_TOKEN_SECRET
    REFRESH_TOKEN_SECRET
    PORT
)

# Export variables from .env file
export $(grep -E "^($(IFS=\|; echo "${required_vars[*]}"))=" .env | xargs)

# Verify all required variables are set
missing_vars=()
for var in "${required_vars[@]}"; do
    [ -z "${!var}" ] && missing_vars+=("$var")
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo "ERROR: Missing required variables in .env:"
    printf ' - %s\n' "${missing_vars[@]}"
    exit 1
fi

# ---------------------------
# 3. BUILD DOCKER IMAGE
# ---------------------------
echo "Building Docker image..."
docker build -t identity-service . || {
    echo "ERROR: Docker build failed"
    exit 1
}

# ---------------------------
# 4. RUN CONTAINER
# ---------------------------
echo "Starting container on port ${PORT:-5000}..."
docker run -d \
    --name identity-service \
    -p ${PORT:-5000}:${PORT:-5000} \
    -e MONGO_URL \
    -e JWT_SECRET \
    -e ACCESS_TOKEN_SECRET \
    -e REFRESH_TOKEN_SECRET \
    --restart unless-stopped \
    identity-service || {
    echo "ERROR: Container startup failed"
    exit 1
}

# ---------------------------
# 5. VERIFY DEPLOYMENT
# ---------------------------
echo "Container started successfully!"
echo "View logs: docker logs -f identity-service"
echo "Stop container: docker stop identity-service"
echo "Remove container: docker rm identity-service"