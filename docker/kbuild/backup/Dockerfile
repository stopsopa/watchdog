FROM ubuntu:18.04

RUN apt-get update && apt-get install -y python3.7 python3-venv mysql-client curl

WORKDIR /home/node/app

COPY . .

RUN ls -la && python3 -m venv venv && venv/bin/pip3 install -r requirements.txt

CMD [ "/bin/bash", "exit.sh" ]













