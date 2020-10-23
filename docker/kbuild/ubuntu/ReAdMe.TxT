https://help.ubuntu.com/lts/serverguide/openssh-server.html
    apt update
    apt install -y openssh-client
    ssh-keygen -t rsa -C "kubercliscript"
    cat ~/.ssh/id_rsa.pub
    rsync -azP root@4x.x.x.x:/var/www/hub/media/images/ public/media/images/








