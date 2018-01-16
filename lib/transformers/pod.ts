import { PodObject } from '../../definitions/resources'
import * as _ from 'lodash'
import * as moment from 'moment'

export type PodTransformer = (pod: PodObject) => object
export interface NameAndReadyAge { name: string, readyAge: Date}

const podTransformer = {
  readyAge: (pod: PodObject) => {
    const name = pod.metadata.name

    const readyAge = _.chain(pod.status.conditions)
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

    return {
      name, readyAge
    }
  }
}

export default podTransformer