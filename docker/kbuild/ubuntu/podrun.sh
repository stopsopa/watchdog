
cp /usr/src/envdir/.env .

mkdir -p ~/.ssh/

cp /usr/src/k8s-ssh-key/* ~/.ssh/

chmod 600 ~/.ssh/id_rsa

cat <<-EOF >> ~/.bashrc

cat <<-EEE

commands that you might need:

  rsync -azP root@domain:/var/www/media/images/ public/media/images/

  rsync -azP public/media/images/ root@4x.x.x.x:/var/www/_____temporary/mm/images/
  rsync -azP public/media/resources/ root@4x.x.x.x:/var/www/_____temporary/mm/resources/

  rsync -azP root@4x.x.x.x:/var/www/_____temporary/mm/images/ public/media/images/
  rsync -azP root@4x.x.x.x:/var/www/_____temporary/mm/resources/ public/media/resources/

  source .env
  cd public/media/podslogs/

  grep 'Timeout acquiring a connection' * -rl
  grep 'Too many connections' * -rl

  printenv | grep -E "(DEP|GIT|BUILD|NODE_NAME)"

  cd ..
  FILE="podslogs-\\\$PROJECT_NAME_SHORT-\\\$(date +"%Y-%m-%d_%H-%M-%S").tar.gz"
  tar -zcvf \\\$FILE podslogs/
  rsync -azP \\\$FILE root@4x.x.x.x:/var/www/_____temporary/

  echo -e "\n\nscp root@4x.x.x.x:/var/www/_____temporary/\\\$FILE .\n\n"

EEE

printenv | grep -E "(DEP|GIT|BUILD|NODE_NAME)"

echo ""

EOF




    if cat ~/.bashrc 2> /dev/null | grep '#colors mod' > /dev/null; then
        echo -e "\033[31m -=file .bashrc have been already modified before=-"
    else
        echo -e "\n#colors mod\nexport EDITOR=vi\ncolor_prompt=yes;\nPS1='${debian_chroot:+($debian_chroot)}\[\033[`if [ "$(id -u)" != "0" ]; then echo '00;32'; else echo '1;30'; fi`m\]\u@\h\[\033[00;31m\]:\[\033[01;34m\]\w\[\033[00;33m\]\$ '\nalias ls='ls --color=auto'\nalias dir='dir --color=auto'\nalias vdir='vdir --color=auto'\nalias grep='grep --color=auto'\nalias fgrep='fgrep --color=auto'\nalias egrep='egrep --color=auto'\neval \"`dircolors -b`\"\nexport HISTCONTROL=ignoreboth:erasedups\nalias con=\"php app/console\"\nalias c=\"/bin/bash clean.sh\"\n" >> ~/.bashrc
        source ~/.bashrc
        echo -e "\033[32m -= .bashrc has been modified =-";
    fi

    if cat ~/.vimrc 2> /dev/null | grep '" colors mod' > /dev/null; then
        echo -e "\033[31m -=file .vimrc has been already modified before=-"
    else
        echo -e "\n\" colors mod\n:set number\n:set hlsearch\n:syntax on\n" >> ~/.vimrc
        echo -e "\033[32m -= .vimrc has been modified =-";
    fi

    if [ ! -f ~/.history_backup ] ; then
        history > ~/.history_backup
    fi



# add to known_hosts
ssh -o StrictHostKeyChecking=no root@4x.x.x.x

# http://bigdatums.net/2017/11/07/how-to-keep-docker-containers-running/
tail -f /dev/null