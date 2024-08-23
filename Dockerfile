###############
#    base     #
###############
FROM node:18

# zipをインストール
RUN apt-get update && apt-get install -y zip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/app