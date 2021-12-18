FROM node:14-slim
LABEL maintainer="chinggg <liuchinggg@gmail.com>"

# ENV NODE_ENV production
ENV LANG C.UTF-8
ENV LC_ALL C.UTF-8

# Install dependencies of puppeteer
RUN sed -i "s/archive.ubuntu./mirrors.cloud.tencent./g" /etc/apt/sources.list && \
    sed -i "s/deb.debian.org/mirrors.cloud.tencent.com/g" /etc/apt/sources.list && \
    sed -i "s/security.debian.org/mirrors.cloud.tencent.com/g" /etc/apt/sources.list && \
    apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    lsb-release \
    wget \
    git

WORKDIR /cli
COPY package*.json ./
RUN npm install
COPY . .

VOLUME [ "/workdir" ]
CMD [ "npm", "start" ]

