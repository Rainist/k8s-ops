import * as _ from 'lodash'

import { PodObject, DeployObject } from '../../definitions/resources'
import Resources from '../resources'
import { APIS } from '../apis'
import { Apis } from '../index';
import { PodTransformer } from '../transformers/pod';

export enum DeploymentStatusType { AsDesired, AllAvailable }

function assertStatusByType (result: DeployObject, statusType: DeploymentStatusType) {
  const { replicas: desired, readyReplicas: ready, updatedReplicas: updated, availableReplicas: available } = result.status

  switch (statusType) {
    case DeploymentStatusType.AsDesired:
      return desired === ready && desired === updated && desired === available
    case DeploymentStatusType.AllAvailable:
      return desired === ready && desired === available
  }
}

const deployResource = (apis: APIS, deployment: string) => Resources(apis).v1beta1.deployment(deployment)
const podsByLabels = (apis: APIS, labels: object) => Resources(apis).v1.pod.matchLabels(labels)

function fetchPods (apis: APIS, deployment: KubernetesClientObject) {
  return deployment.get()
    .then((result: DeployObject) => {
      const { spec: { selector: { matchLabels }}} = result
      return podsByLabels(apis, matchLabels).get()
    })
}

function assertStatus(deployment: KubernetesClientObject) {
  return (statusType: DeploymentStatusType) => deployment.get()
    .then((result: DeployObject) => {
      const assertResult = assertStatusByType(result, statusType)
      if (!assertResult) {
        throw new Error(`${assertResult}`)
      }
      return assertResult
    })
}

interface PodList {
  kind: string,
  items: PodObject[]
}

function pods(apis: APIS, deployment: KubernetesClientObject) {
  return (transformer?: PodTransformer) =>
    fetchPods(apis, deployment)
      .then((result: PodList) => {
        const items = result.items
        if (transformer) {
          return _.map(items, transformer)
        }
        return items
      })
}

export default (apis: APIS, deployment: string) => {
  const deployRes = deployResource(apis, deployment)

  return {
    assertStatus: assertStatus(deployRes),
    pods: pods(apis, deployRes),
  }
}