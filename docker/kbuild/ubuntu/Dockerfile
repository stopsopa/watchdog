FROM ubuntu:18.04

RUN apt-get update && apt-get install -y rsync openssh-client build-essential python net-tools procps tree vim

WORKDIR /home/node/app

#CMD [ "/bin/bash" ]

# http://bigdatums.net/2017/11/07/how-to-keep-docker-containers-running/
#CMD tail -f /dev/null

CMD [ "/bin/bash", "podrun.sh" ]

COPY . .






