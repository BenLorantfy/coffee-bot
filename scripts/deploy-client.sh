client_ip=192.168.2.217
deploy_node_modules=0

echo "Deploying Client..."
ssh pi@$client_ip "mkdir -p ~/Projects/coffee-bot/packages/client"
ssh pi@$client_ip "mkdir -p ~/Projects/coffee-bot/packages/logger"
rsync -auv --delete --progress ./packages/logger pi@$client_ip:~/Projects/coffee-bot/packages --exclude="**/node_modules"
rsync -auv --delete --progress ./packages/client pi@$client_ip:~/Projects/coffee-bot/packages --exclude="**/node_modules"
rsync -auv --delete --progress . pi@$client_ip:~/Projects/coffee-bot --exclude="packages" --exclude="node_modules" --exclude=".git"

echo "Done deploy"