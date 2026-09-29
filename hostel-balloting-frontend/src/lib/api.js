const BASE_URL = import.meta.env.VITE_API_URL

async function apiRequest(path, options = {}) {
  const token = sessionStorage.getItem('token')

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong')
  }

  return data
}

export default apiRequest