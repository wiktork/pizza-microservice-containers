$sb = 'wikservicebus'
$rg = 'wiktork-pizza-rg'
$storage = 'wikpizzastorage'
$container = 'pizza'

$location ="westus3"
$containerappsenv ="wikappenv"
$useridName = 'wikappid'
$acrName = 'wikpizza'

az group create --name $rg --location $location


az servicebus namespace create --name $sb --resource-group $rg --sku Standard
az servicebus topic create --name "order" --namespace-name $sb --resource-group $rg
az storage account create --name $storage --resource-group $rg
az storage container create --name $container --account-name $storage --public-access container

az containerapp env create --name $containerappsenv --resource-group $rg --location $location



az containerapp env dapr-component set --name $containerappsenv --resource-group $rg --dapr-component-name statestore --yaml statestore.yaml
az containerapp env dapr-component set --name $containerappsenv --resource-group $rg --dapr-component-name pubsub --yaml pubsub.yaml

az containerapp create --name order-web --resource-group $rg --environment $containerappsenv --registry-server wikpizza.azurecr.io --image wikpizza.azurecr.io/node-pizza-web:latest --target-port 3000 --ingress external --min-replicas 1 --max-replicas 1 --enable-dapr --dapr-app-id order-web --dapr-app-port 3000 --user-assigned $useridName
az containerapp create --name order-processor-http --resource-group $rg --environment $containerappsenv --registry-server wikpizza.azurecr.io --image wikpizza.azurecr.io/dotnet-pizza-backend:latest --target-port 80 --ingress external --min-replicas 1 --max-replicas 1 --enable-dapr --dapr-app-id order-processor-http --dapr-app-port 80 --user-assigned $useridName

//az acr create --resource-group $rg --name $acrName --sku Standard --location $rg
$userIdentity = az identity create -g $rg -n $useridName --location $location --query clientId -o tsv
$acrId = az acr show --name $acrName --resource-group $rg --query "id" --output tsv
az role assignment create --assignee $userIdentity --role AcrPull --scope $acrId

//docker build -t wikpizza.azurecr.io/node-pizza-web:latest .
//docker push wikpizza.azurecr.io/node-pizza-web:latest

//docker build -t wikpizza.azurecr.io/dotnet-pizza-backend:latest .
//docker push wikpizza.azurecr.io/dotnet-pizza-backend:latest
