param location string
param tags object
param resourceToken string
param backendExists bool
param backendDefinition object
param frontendExists bool
param frontendDefinition object

var prefix = 'hackblr-${resourceToken}'

resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: '${prefix}-la'
  location: location
  tags: tags
  properties: {
    sku: { name: 'PerGB2018' }
  }
}

resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: '${prefix}-env'
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalyticsWorkspace.properties.customerId
        sharedKey: logAnalyticsWorkspace.listKeys().primarySharedKey
      }
    }
  }
}

resource backend 'Microsoft.App/containerApps@2023-05-01' = if (backendExists) {
  name: '${prefix}-backend'
  location: location
  tags: union(tags, { 'azd-service-name': 'backend' })
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 4000
        transport: 'auto'
      }
    }
    template: {
      containers: [
        {
          name: 'main'
          image: backendDefinition.imageName
          env: [
            { name: 'PORT', value: '4000' }
          ]
        }
      ]
    }
  }
}

resource frontend 'Microsoft.App/containerApps@2023-05-01' = if (frontendExists) {
  name: '${prefix}-frontend'
  location: location
  tags: union(tags, { 'azd-service-name': 'frontend' })
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        transport: 'auto'
      }
    }
    template: {
      containers: [
        {
          name: 'main'
          image: frontendDefinition.imageName
          env: [
            { name: 'PORT', value: '3000' }
            { name: 'NEXT_PUBLIC_API_URL', value: backend.properties.configuration.ingress.fqdn }
          ]
        }
      ]
    }
  }
}

output BACKEND_URI string = backendExists ? backend.properties.configuration.ingress.fqdn : ''
output FRONTEND_URI string = frontendExists ? frontend.properties.configuration.ingress.fqdn : ''
