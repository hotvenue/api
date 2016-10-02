# Server Setup
    
    # Update APT
    sudo apt-get update
    
    # Install NVM
    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.1/install.sh | bash
    source .profile
    nvm install stable
    
    # Install git
    sudo apt-get install git -y

    # Install ffmpeg
    sudo add-apt-repository ppa:mc3man/trusty-media -y
    sudo apt-get update
    sudo apt-get install ffmpeg -y
    
    # Install PM2
    npm install pm2 -g
    sudo su -c "env PATH=$PATH:/home/ubuntu/.nvm/versions/node/v6.2.1/bin pm2 startup linux -u ubuntu --hp /home/ubuntu"
    
    # Clone the repo
    git clone https://bitbucket.org/hotvenue/server.git hotvenue-server
    cd hotvenue-server
    npm run start:production
    
