import * as _ from 'lodash'

import Resources from '../resources'
import { APIS } from '../apis'

interface DeployGetResult {
  status: {
    replicas?: number,
    readyReplicas?: number,
    updatedReplicas?: number,
    availableReplicas?: number
  }
}

export enum DeploymentStatusType { AsDesired, AllAvailable }

const assertStatusByType = (result: DeployGetResult, statusType: DeploymentStatusType) => {
  const { replicas: desired, readyReplicas: ready, updatedReplicas: updated, availableReplicas: available } = result.status

  switch (statusType) {
    case DeploymentStatusType.AsDesired:
      return desired === ready && desired === updated && desired === available
    case DeploymentStatusType.AllAvailable:
      return desired === ready && desired === available
  }
}

const deployResource = (apis: APIS, deployment: string) => Resources(apis).v1beta1.deployment(deployment)

function assertStatus(deployment: KubernetesClientObject) {
  return (statusType: DeploymentStatusType) => deployment.get()
    .then((result: DeployGetResult) => {
      const assertResult = assertStatusByType(result, statusType)
      if (!assertResult) {
        throw new Error(`${assertResult}`)
      }
      return assertResult
    })
}

export default (apis: APIS, deployment: string) => {
  const deployRes = deployResource(apis, deployment)
  return {
    assertStatus: assertStatus(deployRes)
  }
}