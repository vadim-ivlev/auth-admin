#!/bin/bash

echo "build a docker image auth-admin:front"
# docker build -t registry.rgwork.ru:5050/masterback/auth-admin/auth-admin:front  -f Dockerfile . 
docker build -t vadimivlev/auth-admin:front  -f Dockerfile . 

echo "push the docker image" 
# docker login registry.rgwork.ru:5050
# docker push registry.rgwork.ru:5050/masterback/auth-admin/auth-admin:front

docker login 
docker push vadimivlev/auth-admin:front

