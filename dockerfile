# Step 1: Build Node.js backend
FROM node:latest as build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Step 2: Server with Node.js
FROM node:latest

# Set working directory
WORKDIR /app

# Copy built files from previous stage
COPY --from=build /app .

# Expose port (optional: adjust as needed)
EXPOSE 8100

# Command to run the application
CMD ["npm", "start"]
