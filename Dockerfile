FROM node:22-alpine

WORKDIR /app


COPY package*.json ./
COPY tsconfig*.json ./
RUN npm ci
RUN npm cache clean --force

COPY . .
RUN npm run build || (rm -rf node_modules package-lock.json && npm install && npm run build)

EXPOSE 5000
CMD ["npm", "start"]
