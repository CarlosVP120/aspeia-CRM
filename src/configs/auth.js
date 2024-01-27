export default {
  meEndpoint: '/api/auth/me',
  loginEndpoint: '/api/jwt/login',
  registerEndpoint: '/api/jwt/register',
  storageTokenKeyName: 'accessToken',
  onTokenExpiration: 'refreshToken' // logout | refreshToken
}
