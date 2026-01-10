FROM node:20

# Install required tools for node-pty AND bash
RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  bash \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
RUN mkdir -p /app/workspace

COPY package.json .
RUN npm install

COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
