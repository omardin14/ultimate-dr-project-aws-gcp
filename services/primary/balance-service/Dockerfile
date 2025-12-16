FROM node:18-alpine

WORKDIR /app

# Copy and build shared package first
COPY packages/shared/package*.json ./packages/shared/
WORKDIR /app/packages/shared
RUN npm install
COPY packages/shared/ ./
RUN npm run build

# Copy balance service files
WORKDIR /app/services/primary/balance-service
COPY services/primary/balance-service/package.json ./

# Modify package.json to remove workspace dependency and add zod
RUN node -e "const fs=require('fs'); const pkg=JSON.parse(fs.readFileSync('package.json')); delete pkg.dependencies['@rewards/shared']; if (!pkg.dependencies.zod) pkg.dependencies.zod='^3.22.4'; fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));"

# Install dependencies
RUN npm install

# Manually create the shared package in node_modules
RUN mkdir -p node_modules/@rewards && \
    cp -r /app/packages/shared node_modules/@rewards/shared && \
    cd node_modules/@rewards/shared && \
    npm install --production

# Copy source code
COPY services/primary/balance-service/src ./src
COPY services/primary/balance-service/tsconfig.json ./tsconfig.json

# Build
RUN npm run build

WORKDIR /app/services/primary/balance-service

EXPOSE 3003

CMD ["npm", "start"]

