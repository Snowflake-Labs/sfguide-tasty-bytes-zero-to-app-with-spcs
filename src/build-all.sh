if [ -z "$repo_url" ]; then
  echo "Missing repo_url env variable, set before calling this script"
  exit
else
  echo "Building and deploying to ${repo_url}"
fi

export tag=tutorial

export image_name=backend_service_image
docker image rm ${image_name}:${tag}
docker build --rm --platform linux/amd64 -t ${image_name}:${tag} ./backend
docker image rm ${repo_url}/${image_name}:${tag}
docker tag ${image_name}:${tag} ${repo_url}/${image_name}:${tag}
docker push ${repo_url}/${image_name}:${tag}
echo ${repo_url}/${image_name}:${tag}

export image_name=frontend_service_image
docker image rm ${image_name}:${tag}
docker build --rm --platform linux/amd64 -t ${image_name}:${tag} ./frontend/frontend
docker image rm ${repo_url}/${image_name}:${tag}
docker tag ${image_name}:${tag} ${repo_url}/${image_name}:${tag}
docker push ${repo_url}/${image_name}:${tag}
echo ${repo_url}/${image_name}:${tag}

export image_name=router_service_image
docker image rm ${image_name}:${tag}
docker build --rm --platform linux/amd64 -t ${image_name}:${tag} ./frontend/router
docker image rm ${repo_url}/${image_name}:${tag}
docker tag ${image_name}:${tag} ${repo_url}/${image_name}:${tag}
docker push ${repo_url}/${image_name}:${tag}
echo ${repo_url}/${image_name}:${tag}