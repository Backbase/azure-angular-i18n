# Azure Angular i18n

This repository demonstrates how we can deploy a multi-language Angular app to Azure using services like Blob Storage and Azure CDN (from Microsoft). The project is similar to the one demonstrated [here](https://github.com/yash-kapila/angular-i18n-s3) using AWS services instead.

## Prerequisites

1. Create a Microsoft Azure free-tire account following instructions [here](https://azure.microsoft.com/en-us/free/).

2. Install [Azure CLI]((https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)) to provision resources through command line.

## Static Apps Deployment Strategies

### Using a web server

Angular docs only document deploying a multi-locale app on a web server such as Nginx or Apache. For more information refer [here](https://angular.io/guide/i18n-common-deploy).

Since a web server is capable to handle incoming requests and prepare a response based on certain logic, it is easier to setup the configuration there to serve different languages.

For example, following logic inside Nginx would let it serve different Angular application based on the URL:

```
location ~ ^/(en|nl) {
    try_files $uri /$1/index.html?$args;
}
```

### Azure Blob Storage & Azure CDN

Running a web server is pretty straightforward and easy to configure. However, there are cheaper and more effective solutions also available to serve static web apps.

#### Azure Blob Storage

Azure Blob storage is Microsoft's object storage solution for the cloud. Blob storage is optimized for storing massive amounts of unstructured data. Unstructured data is data that doesn't adhere to a particular data model or definition, such as text or binary data.

Some of the use cases for Azure Blob Storage are:

- Serving images or static documents directly to a browser.
- Storing files for distributed access.
- Streaming video and audio.
- Storing data for analysis by an on-premises or Azure-hosted service.

Read [here](https://docs.microsoft.com/en-us/azure/storage/blobs/storage-blobs-introduction) for more information about the service.

#### Azure CDN

A content delivery network (CDN) is a distributed network of servers that can efficiently deliver web content to users. CDNs store cached content on edge servers in point-of-presence (POP) locations that are close to end users, to minimize latency.

Azure Content Delivery Network (CDN) offers developers a global solution for rapidly delivering high-bandwidth content to users by caching their content at strategically placed physical nodes across the world.

The benefits of using Azure CDN to deliver web site assets include:

- Better performance and improved user experience for end users, especially when using applications in which multiple round-trips are required to load content.
- Large scaling to better handle instantaneous high loads, such as the start of a product launch event.
- Distribution of user requests and serving of content directly from edge servers so that less traffic is sent to the origin server.

Read [here](https://docs.microsoft.com/en-us/azure/cdn/cdn-overview) for more information about the service.

## Setup

### Project Setup

Following instructions provided by [Angular docs](https://angular.io/guide/i18n-common-overview), the app is prepared for multiple languages, `en` and `nl`. The translation files can be found at `src/locale/`.

API_ROOT for the app is uses `https://swapi.py4e.com` for local development while we make use of a Lambda function serving us static data regarding list and details of planets. Reason why we use the Lambda function was to enable CORS configuration between the function and our app which will be deployed below.

### Production builds per locale

Following is how Angular CLI creates the distribution package for a multi-locale app. Each locale gets its own set of HTML, CSS & JS files ready to be deployed separately.

```
- dist
  - azure-angular-i18n
    - en
      - index.html
      - favicon.ico
      - main.5f84b2e1a0ac5bcdcd0e.js
      - ....
    - nl
      - index.html
      - favicon.ico
      - main.5f84b2e1a0ac5bcdcd0e.js
      - ....
```

### Steps

1. Prepare Angular production builds

    ```bash
    npm run build
    ```

2. Create a [Resource Group](https://docs.microsoft.com/en-us/azure/azure-resource-manager/management/manage-resource-groups-portal). This resource group will be used to club our services together.

    ```bash
    az group create --location westeurope --name azure-angular-i18n
    ```

3. Create a Storage Account and Blob Containers using the provided ARM template

    ```bash
    az deployment group create --resource-group azure-angular-i18n --template-file azure_arm_templates/storage-account/template.json
    ```

4. Create a Azure CDN Standard from Microsoft (classic)

    ```bash
    az deployment group create --resource-group azure-angular-i18n --template-file azure_arm_templates/cdn/template.json
    ```

5. Upload the distribution packages for `nl` and `en` locale in their respective containers.

    ```bash
    # Providing name of storage account as account name and -d flag for container name

    # nl
    az storage blob upload-batch --account-name angulardemoapps -d nl-locale -s dist/azure-angular-i18n/nl/ --overwrite

    # en
    az storage blob upload-batch --account-name angulardemoapps -d en-locale -s dist/azure-angular-i18n/en/ --overwrite
    ```

6. Set the `cache-control` property for the `index.html` file to `no-store` as we don't want our CDN to cache the HTML file. This is because the CDN would otherwise cache `en` **or** `nl` content either the path with context root set as `/` and would serve the html file incorrectly.

    ```bash
    # nl
    az storage blob update --account-name angulardemoapps --container-name nl-locale --name index.html --content-cache "no-store"

    # en
    az storage blob update --account-name angulardemoapps --container-name en-locale --name index.html --content-cache "no-store"
    ```

There seems to be an issue seeing the blobs inside a container in the Azure Portal when the resources are created using the CLI. You may encounter a `403 Forbidden` error while trying to access your blobs in the portal. In order to resolve it, simply logout and re-login.

### Locale Negotiation

Logic for locale negotiation in this project is based on:
1. Request URL
2. Value of a cookie named `locale`

Since Azure Blob Storage is a simple container for static files, there isn't a possibility for us to do locale negotation there. Instead, we make use of the [Rules Engine](https://docs.microsoft.com/en-us/azure/cdn/cdn-standard-rules-engine-reference) provided by the Azure CDN. The Rule Engine evaluates the rules specified for all incoming requests to the CDN and based on criteria defined, decides which locale to serve.

Rules defined for this project can be seen in the resource template(`azure_arm_templates/cdn/template.json`) we used above to create the CDN or can be seen in the Azure Portal once the resource is created.

## Demo

The app can be reached at https://angular-i18n-demo.azureedge.net. It has two Angular routes (`/list` and `/details`).
