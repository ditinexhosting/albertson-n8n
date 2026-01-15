
FROM node:22-alpine

WORKDIR /app

RUN npm install -g pnpm

# copy whole repo (root is build context)
COPY . .

# RUN pnpm install
# RUN pnpm run build

EXPOSE 5678 8080

#CMD ["sh", "-c", "pnpm start & cd packages/frontend/albertsons && pnpm run dev"]

CMD ["sh", "-c", "ls -la"]
