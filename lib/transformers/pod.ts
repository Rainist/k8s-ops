import { PodObject } from '../../definitions/resources'
import * as _ from 'lodash'
import * as moment from 'moment'

export type PodTransformer = (pod: PodObject) => object
export interface NameAndReadyAt { name: string, readyAt?: Date}

const podTransformer = {
  readyAt: (pod: PodObject): NameAndReadyAt => {
    const name = pod.metadata.name

    let readyAt = _.chain(pod.status.conditions)
      .filter((condition) => {
        const { type, status }  = condition
        return type === 'Ready' && status === 'True'
      })
      .map((condition) => {
        const momentObj = moment(condition.lastTransitionTime)
        if (momentObj.isValid()) {
          return momentObj.toDate()
        }
        return null
      })
      .first().value()

    if (!readyAt) readyAt = undefined

    return {
      name, readyAt
    }
  }
}

export default podTransformer