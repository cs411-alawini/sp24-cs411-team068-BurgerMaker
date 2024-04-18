// import { request } from '@umijs/max';
import { request } from '@/app';
import type { ListItemDataType, Params } from './data';

export async function queryFakeList(
  params: Params,
): Promise<{ data: { list: ListItemDataType[] } }> {
  return request('/api/fake_list', {
    params,
  });
}

export async function doPublish(params: object, options?: { [key: string]: any }) {
  try {
    const response = await request('/api/post/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      data: params,
      ...options,
    });
    return response;  // This returns the JSON response body directly if successful.
  } catch (error) {
    console.error('Error during the POST request:', error);
    throw error; // Rethrow to let the caller handle further or log it.
  }
}
