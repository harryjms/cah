source .env
ssh -i $SSH_KEY $SSH_USER@$SSH_HOST 'cd /opt/cah && git fetch && git pull && docker-compose up --build -d api'