FROM node:22-alpine

WORKDIR /app

# Accept build-time arguments for environment variables
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY package*.json ./
COPY tsconfig*.json ./
# Don't copy .env.example since environment variables should be set at runtime
RUN npm ci
RUN npm cache clean --force
COPY . .
RUN rm -f .env

RUN npm run build || (rm -rf node_modules package-lock.json && npm install && npm run build)

EXPOSE 8080
CMD ["npm", "start"]
