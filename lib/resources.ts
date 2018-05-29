import { APIS } from './apis'

function v1(apis: APIS) {
  return {
    hpa: apis.autoscaling.v1.namespaces.horizontalpodautoscalers,
    pod: apis.core.v1.namespace.pod,
    service: apis.core.v1.namespace.service
  }
}

function v1beta1(apis: APIS) {
  return {
    deployment: apis.extentions.v1beta1.namespaces.deployment
  }
}

export default (apis: APIS) => {
  return {
    v1: v1(apis),
    v1beta1: v1beta1(apis)
  }
}
