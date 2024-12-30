FROM node:12.22.0-buster

WORKDIR /app
COPY . /app/

RUN apt-get update && \
  apt-get install -y \
  chromium \
  libatk-bridge2.0-0 \
  libxkbcommon0 \
  libwayland-client0 \
  libgtk-3-0 && \
  rm -rf /var/lib/apt/lists/*

COPY package.json .

RUN npm install 


EXPOSE 5023

CMD ["npm", "start"]
