import Resources from '../resources'
import { APIS } from '../apis'
import { Apis } from '../index'

const serviceResource = (apis: APIS, name: string) => Resources(apis).v1.service(name)

export default (apis: APIS, serviceName: string) => {
  const res = serviceResource(apis, serviceName)
  return {
    res
  }
}