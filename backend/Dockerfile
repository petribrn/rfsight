FROM python:3.12-bullseye
COPY ./requirements.txt /requirements.txt
RUN pip3 install -r requirements.txt
RUN apt update && apt install -y net-tools iputils-ping arp-scan
WORKDIR /app
