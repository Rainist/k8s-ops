# k8s-ops
> Collective useful k8s ops features built on top of awesome [kubernetes-client](https://github.com/godaddy/kubernetes-client)

## Installation

Install via npm:

```console
$ npm i k8s-ops --save
```

## Example

```js
const { Apis, K8SAuthType, Features, DeploymentStatusType, Transformers } = require('k8s-ops')
const { 
  hpa: HPA,
  pod: Pod,
  deploy: Deploy,
  service: Service
} = Features

const namespace = 'kube-system'

const apis = Apis(K8SAuthType.FromKubeconfig, namespace)
const hpa = HPA(apis, 'your-hpa')

hpa.scale({ minReplicas: 5, maxReplicas: 9 }) // Scale HPA with given min/max replicas
  .then(() => hpa.assertScale({ minReplicas: 5, maxReplicas: 9 })) // check if scale is set correctly
  .then(console.log)

const deploy = Deploy(apis, 'heapster')

deploy.assertStatus(DeploymentStatusType.AsDesired) // check if all pods are all up-to-date and available
  .then(console.log)

deploy.pods(Transformers.pod.readyAt) //Using optional transformer to get more consize data and you can implement your own
  .then(console.log)

const pod = Pod(apis, 'your-pod-755b9c7968-r889w')

pod.terminate().then(console.log)

pod.res.get().then(console.log) // use kubernetes-client's objects' feature directly by accessing .res

const service = Service(apis, 'your-service')

service.res.get().then(console.log) // use kubernetes-client's objects' feature directly by accessing .res
```
