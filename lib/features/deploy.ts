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

const assertStatus = (result: DeployGetResult) => {
  const { replicas: desired, readyReplicas: ready, updatedReplicas: updated, availableReplicas: available } = result.status
  return desired === ready && desired === ready && desired === updated && desired === available
}

const deployResource = (apis: APIS, deployment: string) => Resources(apis).v1beta1.deployment(deployment)

function assertStatusAsDesired(apis: APIS) {
  const assert = (deployment: string) =>
    deployResource(apis, deployment).get()
      .then((result: DeployGetResult) => {
        const assertResult = assertStatus(result)
        if (!assertResult) {
          throw new Error(`${assertResult}`)
        }
        return assertResult
      })

  return (deployment: string) => assert(deployment)
}

function deploy(apis: APIS) {
  return {
    assertStatusAsDesired: assertStatusAsDesired(apis)
  }
}

export default deploy