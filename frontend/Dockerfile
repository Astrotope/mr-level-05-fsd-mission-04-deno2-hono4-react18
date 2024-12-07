FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY vite.config.ts ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
