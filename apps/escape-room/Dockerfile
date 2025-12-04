FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Install ALL dependencies including dev (needed for TypeScript build)
RUN npm ci --include=dev

COPY . .
RUN npm run build

# Remove dev dependencies after build to reduce image size
RUN npm prune --omit=dev

EXPOSE 8080
CMD ["npm", "start"]
