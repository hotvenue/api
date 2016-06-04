# Server Setup

    # Install NVM
    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.1/install.sh | bash
    source .profile
    nvm install stable

    # Install ffmpeg
    sudo add-apt-repository ppa:mc3man/trusty-media -y
    sudo apt-get update
    sudo apt-get install ffmpeg -y
    
    # Clone the repo
    git clone https://bitbucket.org/spotview/server.git spotvenue-server
    npm run start:production
    
