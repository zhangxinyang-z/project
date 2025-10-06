import request from '@/utils/request'

export function getEngineData() {
  return request({
    url: '/engines',
    method: 'get'
  })
}