# Pizza Order App Demo

This demo is a containerized microservice application consisting of a Node.js web app taking Pizza orders from customers, and an .NET 6 backend for dispatching the order to be made and for getting order status upon customer inqueries. The instruction is for testing locally and deploying to Azure Container Apps platform. This tutorial was created on Windows 11. The command line deployment scripts may vary on different platforms.
* [Demo Walkthrough](#demo-walkthrough)
* [Pre-requisites](#pre-requisites)
* [Test locally](#test-locally)
* [Deploy to Azure](#deploy-to-azure)

## Demo Walkthrough
The Pizza Order App demo has the following features:
* Browse pizza options on homepage 
* Add pizzas to cart on homepage
* Edit shopping cart
* Submit order
* Check oder status by order ID

**1. Browse pizza options and add to cart on the homepage**
![Homepage](./images/PizzaHome.png)

**2. Add pizzas to cart on homepage**
![Add Pizza to Cart](./images/AddPizzaToCart.png)

**3. Edit shopping cart**
![Edit cart](./images/EditCart.png)

**4. Submit Order**
![Submit order](./images/SubmitOrder.png)

**5. Check oder status by order ID**
![Check order status](./images/CheckOrderStatus.png)
![Order Status displayed](./images/OrderStatusDisplayed.png)

## Pre requisites
* Install [Docker](https://docs.docker.com/engine/install/)
* Install [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/)
* Install [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
* Install [Node.js](https://nodejs.org/download/)
* Install [.NET 6](https://dotnet.microsoft.com/download/dotnet/6.0)
* Have a working Azure subscription
* Create an [Azure Service Bus](https://learn.microsoft.com/azure/service-bus-messaging/service-bus-create-namespace-portal) with *Standard* sku or above. Create a *Topic* called *order*
```
az servicebus namespace create --name "your_service_bus_name" --resource-group "your_resource_group_name" --sku Standard
```
```
az servicebus topic create --name "order" --namespace-name "your_service_bus_name" --resource-group "your_resource_group_name"
```

* Create an [Azure Storage account](https://learn.microsoft.com/azure/storage/common/storage-account-create?tabs=azure-portal). Create a new *blob container*.
```
az storage account create --name "your_storage_account_name" --resource-group "your_resource_group_name"
```
```
az storage container create --name "your_container_name" --account-name "your_storage_account_name" --public-access container
```

* Create an [Application Insights](https://learn.microsoft.com/azure/azure-monitor/app/create-new-resource)
```
az extension add -n application-insights
```
```
az monitor app-insights component create --app "your_appinsights_name" --location "your_location" --resource-group "your_resource_group_name"
```

## Test Locally
Download this repository to test the code locally.
### Edit Dapr component files
In */components* directory there are two Dapr component files:
* pubsub.yaml
* statestore.yaml

Put your Azure service bus connection string in pubsub.yaml and Azure Storage blob info in statestore.yaml.

### Start Dapr process
```
dapr init
```

### Run PizzaWeb
Change project to the *PizzaWeb* directory. 

Set App Insights connection string environment vairable:
```
set APPLICATIONINSIGHTS_CONNECTION_STRING="your_appinsights_connectionstring"
```

Initialize the project:
```
npm install
```
Run the service with Dapr side car process:

Run the following command under the dir *pizza-microservice-containers/PizzaWeb*
```
dapr run --dapr-http-port 3500 --app-id order-web --components-path ../components_local/ --app-port 3001 -- npm run debug
```

Web application's entry point is : http://localhost:3000/ 

## PizzaOrderProcessor
Change project to the *PizzaOrderProcessor* directory.

Set App Insights connection string environment vairable:
```
set APPLICATIONINSIGHTS_CONNECTION_STRING="your_appinsights_connectionstring"
```

Initialize the project:
```
dotnet restore
dotnet build
```
Run the service with Dapr side car process:
```
dapr run --dapr-http-port 3600 --app-id order-processor-http --components-path ../components_local/ --app-port 3001 -- dotnet run --project .
```
The Pizza Demo App should be running locally now. Test by creating orders and checking for order status. 

## Deploy To Azure
In */aca-dapr-components* directory there are two Dapr component files:
* pubsub.yaml
* statestore.yaml

Put your Azure Service Bus connection string in pubsub.yaml and Azure Storage blob container info in statestore.yaml.

### Login to Azure using Azure CLI

1. Login using your Azure account
```azure cli
az login
```
2. Select a subscription if your account is associated with multiple subscriptions
```azure cli
az account set --s "your subscription ID"
```

3. Add Azure Container App CLI extenion
```
az extension add --name containerapp --upgrade
```

4. Register Container App namespace in your subscription
```
az provider register --namespace Microsoft.App
```

5. Register Log Analytics workspace in your subscription
```
az provider register --namespace Microsoft.OperationalInsights
```

### Create Azure Container App Environment in Azure
1. Create environment variables in Command Prompt:
```azure cli
set RESOURCE_GROUP="your resource group name"
set LOCATION="westus"
set CONTAINERAPPS_ENVIRONMENT="your container app environment name"
```

2. Create resource group
```azure cli
az group create --name %RESOURCE_GROUP% --location %LOCATION%
```

3. Create Azure Container App Environment
```azure cli
az containerapp env create --name %CONTAINERAPPS_ENVIRONMENT% --resource-group %RESOURCE_GROUP% --location %LOCATION% --dapr-instrumentation-key your_appinsights_key --logs-workspace-id your_workspace_id
```

### Deploy Dapr component
Change directory to */aca-dapr-components*

1. Deploy session state store
```
az containerapp env dapr-component set --name %CONTAINERAPPS_ENVIRONMENT% --resource-group %RESOURCE_GROUP% --dapr-component-name statestore --yaml statestore.yaml
```

2. Deploy pubsub 
```
az containerapp env dapr-component set --name %CONTAINERAPPS_ENVIRONMENT% --resource-group %RESOURCE_GROUP% --dapr-component-name pubsub --yaml pubsub.yaml
```

### Deploy Node.js webapp
Assuming container images has been built using the dockerfile in PizzaWeb and pushed to Dockerhub.

```
az containerapp create --name order-web --resource-group %RESOURCE_GROUP% --environment %CONTAINERAPPS_ENVIRONMENT%  --image <your docker hub account>/node-pizza-web-appinsights:latest --target-port 3000 --ingress external --min-replicas 1 --max-replicas 1 --enable-dapr --dapr-app-id order-web --dapr-app-port 3000 --env-vars "APPLICATIONINSIGHTS_CONNECTION_STRING=<your_appinsights_connectionstring>"
```

### Deploy order dispatcher backend
Assuming container images has been built using the dockerfile in PizzaWeb and pushed to Dockerhub.

```
az containerapp create --name order-processor-http --resource-group %RESOURCE_GROUP% --environment %CONTAINERAPPS_ENVIRONMENT% --image <your docker hub account>/dotnet-pizza-backend-appinsights:latest --target-port 80 --ingress external --min-replicas 1 --max-replicas 1 --enable-dapr --dapr-app-id order-processor-http --dapr-app-port 80 --env-vars "APPLICATIONINSIGHTS_CONNECTION_STRING=<your_appinsights_connectionstring>"
```