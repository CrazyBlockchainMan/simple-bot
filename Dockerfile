# Use an official Node.js runtime as a base image
FROM node:14

# Set the working directory inside the container
WORKDIR /root/simple-bot

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install Node.js dependencies
RUN npm install --production

# Copy the rest of your application code to the working directory
COPY . .

# Command to run your application
CMD ["npm", "start"]
