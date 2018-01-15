import * as _ from 'lodash'

import Resources from '../resources'
import { APIS } from '../apis'

type HPAScaleType = { minReplicas?: number, maxReplicas?: number }

interface HPAGetResult {
  spec: HPAScaleType
}

const hpaObject = (apis: APIS, hpa: string) => Resources(apis).v1.hpa(hpa)

function scale(apis: APIS) {
  const buildBody = (scaleOption: HPAScaleType) => {
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

  const patch = (hpa: string, scaleOption: HPAScaleType) => {
    const body = buildBody(scaleOption)
    return hpaObject(apis, hpa)
      .patch(body)
      .then(() => hpaObject(apis, hpa).get())
      .then((result: HPAGetResult) => {
        const { minReplicas, maxReplicas } = result.spec
        return { minReplicas, maxReplicas }
      })
  }

  return (hpa: string, scaleOption: HPAScaleType) => patch(hpa, scaleOption)
}

function assertScale(apis: APIS) {
  const assertSpec = (scaleOption: HPAScaleType, resultSpec: HPAScaleType) => {
    console.log(scaleOption)
    console.log(resultSpec)
    const { minReplicas, maxReplicas } = scaleOption
    let result = _.isNumber(minReplicas) || _.isNumber(maxReplicas)

    if (_.isNumber(minReplicas)) {
      result = result && (minReplicas === resultSpec.minReplicas)
    }
    if (_.isNumber(maxReplicas)) {
      result = result && (maxReplicas === resultSpec.maxReplicas)
    }

    return result
  }

  const assert = (hpa: string, scaleOption: HPAScaleType) =>
    hpaObject(apis, hpa).get()
      .then((result: HPAGetResult) => {
        const { minReplicas, maxReplicas } = result.spec
        return assertSpec(scaleOption, { minReplicas, maxReplicas })
      })

  return (hpa: string, scaleOption: HPAScaleType) => assert(hpa, scaleOption)
}

function hpa(apis: APIS) {
  return {
    scale: scale(apis),
    assertScale: assertScale(apis)
  }
}

export default hpa