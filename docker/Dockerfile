FROM node:22-alpine

LABEL org.opencontainers.image.title="THUNDERFIRE MCP Server"
LABEL org.opencontainers.image.description="Autonomous node management via Model Context Protocol"
LABEL org.opencontainers.image.source="https://github.com/mayayai/tf-mcp-server"
LABEL org.opencontainers.image.vendor="MAYAYAI"
LABEL org.opencontainers.image.licenses="MIT"

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production

# Copy built files
COPY dist/ ./dist/

# Set environment defaults
ENV THUNDERFIRE_API_URL=http://localhost:8080
ENV THUNDERFIRE_TIMEOUT=30000

# Run as non-root user
RUN addgroup -g 1001 -S thunderfire && \
    adduser -S thunderfire -u 1001 -G thunderfire
USER thunderfire

ENTRYPOINT ["node", "dist/index.js"]
