FROM node:24-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy only Prisma schema and generate client
COPY src/db/prisma ./src/db/prisma
RUN npx prisma generate --schema=src/db/prisma/schema.prisma

# Copy the rest of the source code
COPY . .

# Expose backend port
EXPOSE 4000

# Run migrations & start the app
CMD ["sh", "-c", "npx prisma migrate deploy --schema=src/db/prisma/schema.prisma && npm start"]
