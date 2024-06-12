$env:REGION ="us-east4"
$env:GCLOUD_PROJECT = "docker-k8s-425911"
$env:REPO = "test-1"
$env:IMAGE = "server"

$env:IMAGE_TAG = "${env:REGION}-docker.pkg.dev/$env:GCLOUD_PROJECT/$env:REPO/$env:IMAGE"

# us-east4-docker.pkg.dev/docker-k8s-425911/test-1
docker build -t $env:IMAGE_TAG -f Dockerfile --platform linux/x86_64 .


docker push $env:IMAGE_TAG
