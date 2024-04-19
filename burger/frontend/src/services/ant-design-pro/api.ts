// @ts-ignore
/* eslint-disable */
import {request} from '@/app';

export async function currentUser(options?: { [key: string]: any }) {
  return request('/api/user', {
    method: 'GET',
    ...(options || {}),
  })
}


export async function outLogin(options?: { [key: string]: any }) {
  return request<Record<string, any>>('/api/login/outLogin', {
    method: 'POST',
    ...(options || {}),
  });
}

/** 登录接口 POST /api/login/account */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
