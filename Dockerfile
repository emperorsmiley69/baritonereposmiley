FROM node:18-slim

# Install system dependencies needed for building headless gl/canvas native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    pkg-config \
    libxi-dev \
    libgl1-mesa-dev \
    libglu1-mesa-dev \
    libglew-dev \
    libc6-dev \
    libpixman-1-dev \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose the web dashboard port
EXPOSE 5000

CMD ["npm", "start"]
