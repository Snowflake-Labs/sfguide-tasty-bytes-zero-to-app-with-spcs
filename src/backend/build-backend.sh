export tag=tutorial

export image_name=backend_service_image
docker build --rm --platform linux/amd64 -t ${image_name}:${tag} --no-cache ./
docker tag ${image_name}:${tag} ${repo_url}/${image_name}:${tag}
docker push ${repo_url}/${image_name}:${tag}
echo ${repo_url}/${image_name}:${tag}