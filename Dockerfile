FROM node:20-alpine

# Install necessary dependencies
RUN apk add --no-cache \
    chromium \
    libatk \
    libxkbcommon \
    wayland-libs-client \
    gtk+3.0

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json .
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the application port
EXPOSE 3000

# Run the application
CMD ["npm", "start"]
