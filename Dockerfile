FROM oven/bun:1.2.8-alpine AS production

COPY package.json ./
COPY bun.lockb ./
COPY src/ ./src

RUN bun install

CMD ["bun", "run", "src/index.js"]
