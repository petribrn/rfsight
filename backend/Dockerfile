FROM python:3.12
COPY ./requirements.txt /requirements.txt
RUN apt update && apt install -y python3-full python3-pip net-tools iputils-ping arp-scan
RUN apt upgrade -y
RUN pip3 install -r requirements.txt
WORKDIR /app
