import * as _ from 'lodash'

import Resources from '../resources'
import { APIS } from '../apis'

type HPAScaleType = { minReplicas?: number, maxReplicas?: number }

interface HPAGetResult {
  spec: HPAScaleType
}

const hpaResource = (apis: APIS, hpa: string): KubernetesClientObject => Resources(apis).v1.hpa(hpa)

const buildBodyOfScaling = (scaleOption: HPAScaleType) => {
  const { minReplicas, maxReplicas } = scaleOption
  let spec = {}

  if (_.isNumber(minReplicas) && minReplicas > 0) {
    spec = { ...spec, minReplicas }
  }
  if (_.isNumber(maxReplicas) && ( minReplicas === undefined || maxReplicas > minReplicas )){
    spec = { ...spec, maxReplicas }
  }

  return { body: { spec } }
}

const scaling = {
  buildBody: buildBodyOfScaling,
  scale: (hpa: KubernetesClientObject, scaleOption: HPAScaleType) => {
    const body = buildBodyOfScaling(scaleOption)
    return hpa
      .patch(body)
      .then(() => hpa.get())
      .then((result: HPAGetResult) => {
        const { minReplicas, maxReplicas } = result.spec
        return { minReplicas, maxReplicas }
      })
  },
  assertSpec: (scaleOption: HPAScaleType, resultSpec: HPAScaleType) => {
    const { minReplicas, maxReplicas } = scaleOption
    let result = _.isNumber(minReplicas) || _.isNumber(maxReplicas)

    if (_.isNumber(minReplicas)) {
      result = result && (minReplicas === resultSpec.minReplicas)
    }
    if (_.isNumber(maxReplicas)) {
      result = result && (maxReplicas === resultSpec.maxReplicas)
    }

    return result
  },
  assert: (hpa: KubernetesClientObject, scaleOption: HPAScaleType) =>
    hpa.get()
      .then((result: HPAGetResult) => {
        const { minReplicas, maxReplicas } = result.spec
        const assertResult = scaling.assertSpec(scaleOption, { minReplicas, maxReplicas })
        if (!assertResult) {
          throw new Error(`${assertResult}`)
        }
        return assertResult
      })
}

export default (apis: APIS, hpa: string) => {
  const hpaRes = hpaResource(apis, hpa)
  return {
    scale: (scaleOption: HPAScaleType) => scaling.scale(hpaRes, scaleOption),
    assertScale: (scaleOption: HPAScaleType) => scaling.assert(hpaRes, scaleOption)
  }
}