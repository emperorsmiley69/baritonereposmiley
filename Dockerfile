FROM node:18-slim

# Install core build engines along with virtual framebuffers for graphics processing
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    pkg-config \
    xvfb \
    mesa-utils \
    libgl1-mesa-dri \
    libglapi-mesa \
    libgl1-mesa-dev \
    libglu1-mesa-dev \
    libglew-dev \
    libxi-dev \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

# Instruct npm to pass building errors safely without locking up the installation pipeline
RUN npm install --unsafe-perm || npm install --legacy-peer-deps

COPY . .

EXPOSE 5000

# Launch the script inside a virtual display layer to prevent headless WebGL crashes
CMD ["xvfb-run", "-s", "-ac -screen 0 1280x1024x24", "npm", "start"]
