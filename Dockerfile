FROM node

WORKDIR /app

COPY package*.json ./

RUN npm install
COPY . .
RUn npm rebuild
RUN npm run build

EXPOSE 8000

CMD ["node", "dist/server.js"]