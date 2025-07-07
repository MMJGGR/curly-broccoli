FROM node:18-alpine
WORKDIR /app
COPY package.json .
COPY tailwind.config.js .
COPY postcss.config.js .
COPY public ./public
COPY src ./src
RUN npm install
CMD ["npm", "start"]
