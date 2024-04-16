// import {request} from '@umijs/max';
import {request} from '@/app'


export async function getMarketValue(options?: { [key: string]: any }) {
  return request('/api/trade/value', {
    method: 'GET',
    ...(options || {}),
  })
}

export async function getPostLike(options?: { [key: string]: any }) {
  return request('/api/post/like', {
    method: 'GET',
    ...(options || {}),
  })
}

export async function getTrade(options?: { [key: string]: any }) {
  return request('/api/trade', {
    method: 'GET',
    ...(options || {}),
  })
}

export async function fetchPortfolios(userId: string, options?: { [key: string]: any }) {
  return request(
    `/test/${userId}/portfolio`,
    {
      method: 'GET',
      ...(options || {}),
    }
  )
}

export async function fetchPortfoliosStatusAndCost(userId: string, options?: { [key: string]: any }) {
  return request(
    `/test/${userId}/portfolio-status`,
    {
      method: 'GET',
      ...(options || {})
    }
  )
}

export async function fetchTrades(portfolioId: string, options?: { [key: string]: any }) {
  return request(
    `/test/${portfolioId}/trade`,
    {
      method: 'GET',
      ...(options || {})
    }
  )
}

export async function getHold(userId: string, options?: { [key: string]: any }) {
  return request(
    `/test/${userId}/holds`,
    {
      method: 'GET',
      ...(options || {})
    }
  )
}
