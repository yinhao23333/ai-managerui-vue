import request from '@/utils/request'

// 查询音乐 cookies账号列表
export function getCookieList(query) {
  return request({
    url: '/api/cookie/list',
    method: 'get',
    params: query
  })
}
// 查询mv cookies账号列表
export function getMvTokenList(query) {
    return request({
      url: '/api/mvToken/list',
      method: 'get',
      params: query
    })
}
// 新增音乐 cookies账号
export function addCookieList(data) {
    return request({
      url: '/api/cookie/add',
      method: 'post',
      data: data
    })
  }
  // 新增音乐 cookies账号
export function addMvTokenList(data) {
    return request({
      url: '/api/mvToken/add',
      method: 'post',
      data: data
    })
  }