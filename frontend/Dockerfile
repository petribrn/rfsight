FROM node:latest
COPY ./docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
WORKDIR /app
RUN apt update
RUN apt-get install -y net-tools iproute2 iputils-ping curl
RUN apt upgrade -y
EXPOSE 3005
EXPOSE 4173
ENTRYPOINT [ "/docker-entrypoint.sh" ]
