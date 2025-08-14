# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install app dependencies
RUN pnpm install --prod

# Copy app source
COPY . .

# Generate the Prisma client
RUN pnpm prisma generate

# The command to run when the container starts
CMD ["pnpm", "exec", "ts-node", "--esm", "scripts/run-worker.ts"]

# Expose a port if the worker had an HTTP server (e.g., for health checks)
# EXPOSE 3001
