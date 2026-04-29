FROM node:20-slim

# Install necessary dependencies
RUN apt-get update && apt-get install -y \
    curl \
    git \
    jq \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Supabase CLI
RUN arch=$(uname -m) && \
    if [ "$arch" = "x86_64" ]; then arch="amd64"; elif [ "$arch" = "aarch64" ]; then arch="arm64"; fi && \
    curl -sL "https://github.com/supabase/cli/releases/latest/download/supabase_linux_${arch}.tar.gz" | tar -xz -C /usr/local/bin supabase

# Set working directory
WORKDIR /app

# Copy the entire project
COPY . /app

# Make setup script executable
RUN chmod +x /app/setup.sh

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install

# Expose Vite dev server port
EXPOSE 5173

# Set default working directory back to /app
WORKDIR /app

# Run setup script by default
CMD ["./setup.sh"]
