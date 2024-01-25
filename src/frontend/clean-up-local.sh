docker rm frontend-router_service-1
docker rm frontend-frontend_service-1

docker image rm frontend-router_service:latest  --force
docker image rm frontend-frontend_service:latest  --force