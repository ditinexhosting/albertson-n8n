FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm

# copy whole repo (root is build context)
COPY . .

RUN pnpm install --ignore-scripts
RUN pnpm run build

EXPOSE 5678 8080

CMD ["sh", "-c", "pnpm start & cd packages/frontend/albertsons && pnpm run dev"]