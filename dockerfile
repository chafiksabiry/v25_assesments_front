# Use a lightweight Node.js base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

ENV VITE_API_URL=https://preprod-api-repcreationwizard.harx.ai/api
ENV VITE_OPENAI_API_KEY=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
#ENV VITE_RUN_MODE=standalone
ENV VITE_RUN_MODE=in-app
#user id for standalone mode 
ENV VITE_STANDALONE_USER_ID=6814d30f2c1ca099fe2b16b6
ENV VITE_STANDALONE_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODE0ZDMwZjJjMWNhMDk5ZmUyYjE2YjYiLCJpYXQiOjE3NDYxOTUyOTN9.a90uzRBEG80YGZWlROdZh8fF8lgPUgNkm7oUX5iG1MM
ENV VITE_STANDALONE_AGENT_ID=681b24379b4ac5f1931a7299
ENV VITE_STANDALONE_RETURN_URL=https://preprod-rep-dashboard.harx.ai/profile
ENV VITE_RETURN_URL=/repdashboard/profile
ENV VITE_FRONT_URL=https://preprod-rep-assessments.harx.ai/

# Install dependencies
RUN npm install

# Copy the source code
COPY . .

# Build the app
RUN npm run build

# Install a lightweight HTTP server to serve the build
RUN npm install -g serve

# Expose the port for the HTTP server
EXPOSE 5175

# Command to serve the app
CMD ["serve", "-s", "dist", "-l", "5175"]