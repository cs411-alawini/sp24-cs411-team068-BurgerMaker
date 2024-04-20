import {request} from "@/app"

export async function updateUser(data: object, options?: { [key: string]: any }) {
  return request('/api/user', {
    method: 'PUT',
    data: {
      ...data
    },
    ...(options || {}),
  })
}
