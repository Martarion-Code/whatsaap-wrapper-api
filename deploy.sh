# Exit immediately if any command fails
set -e
git checkout master
git pull origin_server master --force || true
docker build -t registry.gitlab.com/repo . 
docker stop repo || true
docker rm repo || true
docker run -p 6040:3000 -d --name repo registry.gitlab.com/repo 
docker image prune --force --filter='dangling=true'
