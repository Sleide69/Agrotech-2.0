const TOKEN_KEY = 'agrotech_token'

export function useAuth() {
  const getToken = () => localStorage.getItem(TOKEN_KEY)
  const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t)
  const clear = () => localStorage.removeItem(TOKEN_KEY)
  const isAuthenticated = () => !!getToken()
  return { getToken, setToken, clear, isAuthenticated }
}
