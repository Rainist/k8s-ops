import { APIS } from './apis'

function v1(apis: APIS) {
  return {
    hpa: (hpa: string) => apis.autoscaling.v1.namespaces.horizontalpodautoscalers(hpa)
  }
}

function v1beta1(apis: APIS) {
  return {
    deployment: (deployment: string) => apis.extentions.v1beta1.namespaces.deployment(deployment)
  }
}

export default (apis: APIS) => {
  return {
    v1: v1(apis),
    v1beta1: v1beta1(apis)
  }
}
