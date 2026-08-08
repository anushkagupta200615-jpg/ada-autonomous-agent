# Dockerfile for Hugging Face Spaces (Backend)
FROM node:18-bullseye-slim

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY server/package*.json ./

# Install dependencies
RUN npm install

# Bundle app source
COPY server/ ./

# Hugging Face Spaces expects the service to run on port 7860
ENV PORT=7860
EXPOSE 7860

# Start the backend server
CMD ["node", "server.js"]
