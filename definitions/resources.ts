export interface PodObject {
  metadata: { name: string, namespace: string }
  status: {
    conditions: [
      {
        type: string,
        status: string,
        lastTransitionTime: string
      }
    ]
  }
}

export interface DeployObject {
  metadata: { name: string, namespace: string }
  spec: {
    selector: {
      matchLabels: object
    }
  },
  status: {
    replicas?: number,
    readyReplicas?: number,
    updatedReplicas?: number,
    availableReplicas?: number
  }
}