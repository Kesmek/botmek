## build runner
FROM node:current-alpine as build-runner

# Set temp directory
WORKDIR /tmp/app

# Move package.json
COPY package.json .

# Install dependencies
RUN npm install

# Move source files
COPY src ./src
COPY tsconfig.json .
COPY prisma ./prisma
COPY .env .
RUN npx prisma db push

# Build project
RUN npm run build

## producation runner
FROM node:current-alpine as prod-runner

# Set work directory
WORKDIR /app

# Copy package.json from build-runner
COPY --from=build-runner /tmp/app/package.json /app/package.json

# Install dependencies
RUN npm install --only=production

# Move build files
COPY --from=build-runner /tmp/app/build /app/build
COPY --from=build-runner /tmp/app/prisma /app/prisma
COPY --from=build-runner /tmp/app/.env /app/.env
RUN npx prisma generate

# Start bot
CMD [ "node", "build/main.js" ]
