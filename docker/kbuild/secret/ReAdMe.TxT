kubectl delete secret regcred

kubectl create secret docker-registry regcred \
    --docker-server=docker-registry.xxx.com \
    --docker-username=admin \
    --docker-password=password \
    --docker-email=admin@gmail.com
