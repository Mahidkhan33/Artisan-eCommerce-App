FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json  ./
COPY tsconfig.json ./


RUN npm install


COPY . .




RUN npm run build 


FROM node:20-alpine

WORKDIR /app


COPY package*.json ./


# Install all dependencies for development (tsx is needed for npm run dev)
RUN npm install


COPY --from=builder /app/dist ./dist


EXPOSE 8000
# Start server
CMD ["npm", "start"]
