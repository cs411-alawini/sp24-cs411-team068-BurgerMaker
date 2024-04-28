import {request} from '@/app'
import { AssetItemDataType } from './data.d'

export async function getAssetsList(
    count: number, 
    offset: number, 
    search_text: string, 
    rankers: string[],
    options?: { [key: string]: any }): 
  Promise<{ data: AssetItemDataType[] }> {
    console.log(options)
  return request('/api/assets', {
    method: 'GET',
    params: {
      count,
      offset,
      search_text,
      rankers,
    },
    ...(options || {}),
  }).catch((error) => {
    console.error('Get assets list failed:', error.message);
    throw error;
  });
}

export async function getPortfolioData(userId: string, options?: { [key: string]: any }): Promise<{ data: any[] }> {
  return request('/api/portfolio', {
    method: 'GET',
    params: {
      userId,
    },
    ...(options || {}),
  }).catch((error) => {
    console.error('Get portfolio data failed:', error.message);
    throw error;
  });
}


export async function trade(asset_id: string, portfolio_name: string, quantity: number, price: number, options?: { [key: string]: any }): Promise<{ data: any }> {
  return request('/api/assets/trade', {
    method: 'POST',
    data: {
      asset_id,
      portfolio_name,
      quantity,
      price,
    },
    ...(options || {}),
  }).catch((error) => {
    // console.error('Trade failed:', error.message);
    throw error;
  });
}

export async function getAssetsTrending(asset_id: string, options?: { [key: string]: any }): Promise<{ data: AssetItemDataType[] }> {
  return request('/api/assets/trending', {
    method: 'GET',
    params: {
      asset_id,
    },
    ...(options || {}),
  }).catch((error) => {
    console.error('Get assets trending failed:', error.message);
    throw error;
  });
}