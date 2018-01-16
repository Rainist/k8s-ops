import * as _ from 'lodash'

import Resources from '../resources'
import { APIS } from '../apis'
import { Apis } from '../index';

const podResource = (apis: APIS, name: string) => Resources(apis).v1.pod(name)
const terminate = (pod: KubernetesClientObject) => () => pod.delete()

export default (apis: APIS, pod: string) => {
  const podRes = podResource(apis, pod)
  return {
    res: podRes,
    terminate: terminate(podRes)
  }
}