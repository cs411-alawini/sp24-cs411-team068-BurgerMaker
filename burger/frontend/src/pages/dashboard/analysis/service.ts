// import {request} from '@umijs/max';
import {request} from '@/app'


export async function getMarketValue(options?: { [key: string]: any }) {
  return request('/api/trade/value', {
    method: 'GET',
    ...(options || {}),
  })
}

export async function getOldMarketValue(endTime: string, options?: { [key: string]: any }) {
  return request(`/api/trade/value/${endTime}`, {
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

export async function getPostCount(options?: { [key: string]: any }) {
  return request('/api/post/count', {
    method: 'GET',
    ...(options || {}),
  })
}

export async function getBalance(options?: { [key: string]: any }) {
  return request('/api/balance', {
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

export async function fetchPortfolios(options?: { [key: string]: any }) {
  return request(
    `/api/portfolio`,
    {
      method: 'GET',
      ...(options || {}),
    }
  )
}

export async function fetchPortfoliosStatusAndCost(options?: { [key: string]: any }) {
  return request(
    `/api/portfolio-status`,
    {
      method: 'GET',
      ...(options || {})
    }
  )
}

export async function fetchTrades(portfolioId: string, options?: { [key: string]: any }) {
  return request(
    `/api/${portfolioId}/trade`,
    {
      method: 'GET',
      ...(options || {})
    }
  )
}

export async function fetchPortfolioAdvice(portfolioId: string, options?: { [key: string]: any }) {
  return request(
    `/api/${portfolioId}/advice`,
    {
      method: 'GET',
      ...(options || {})
    }
  )
}

export async function genPortfolioAdvice(portfolioId: string, options?: { [key: string]: any }) {
  return request(
    `/api/advice/${portfolioId}`,
    {
      method: 'GET',
      ...(options || {})
    }
  )
}



export async function getTotalCostOfUser(options?: { [key: string]: any }) {
  return request(
    `/api/cost-info-of-user`,
    {
      method: 'GET',
      ...(options || {})
    }
  )
}

export async function fetchPortfolioTrade(portfolioId: string, options?: { [key: string]: any }) {
  return request(
    `/api/${portfolioId}/holds`,
    {
      method: 'GET',
      ...(options || {})
    }
  )
}
