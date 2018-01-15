import * as Api from 'kubernetes-client'

export enum K8SAuthType { InCluster, FromKubeconfig }

export interface AuthConfig {
  url: string
  ca: string,
  auth: object
  key?: string,
  cert?: string,
}

export type K8SAuthOption = K8SAuthType | AuthConfig

const emptyCustomAuthConfig: AuthConfig = {
  ca: 'please provide this ca',
  url: 'and://url',
  auth: { token: 'maybe' }
}

function authConfig(auth: K8SAuthOption): AuthConfig {
  if (auth as number in K8SAuthType) {
    switch (auth as K8SAuthType) {
      case K8SAuthType.FromKubeconfig:
      return Api.config.fromKubeconfig()
      case K8SAuthType.InCluster:
      return Api.config.getInCluster()
      default:
      return emptyCustomAuthConfig
    }
  }
  else {
    try {
      return auth as AuthConfig
    } catch (error) {
      return emptyCustomAuthConfig
    }
  }
}

export interface APIS {
  extentions: {
    v1beta1: any
  },
  autoscaling: {
    v1: any
  }
}

export function Apis(auth: K8SAuthOption, namespace: string, promises: boolean = true, timeout: number = 5000 ): APIS {
  const authconfig = authConfig(auth)
  const config = { ...authconfig, namespace, request: { timeout }, promises}

  return {
    extentions: {
      v1beta1: new Api.Extensions({ ...config, version: 'v1beta1' })
    },
    autoscaling: {
      v1: new Api.ThirdPartyResources({
        ...config,
        group: 'autoscaling',
        version: 'v1',
        resources: ['horizontalpodautoscalers']
      })
    }
  }
}