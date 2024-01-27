// ** JWT import
import jwt from 'jsonwebtoken'

// ** Default AuthConfig
import defaultAuthConfig from 'src/configs/auth'

const users = [
  {
    id: 1,
    role: 'admin',
    password: 'admin',
    fullName: 'John Doe',
    username: 'johndoe',
    email: 'admin@aspeia.com'
  },
  {
    id: 2,
    role: 'client',
    password: 'client',
    fullName: 'Jane Doe',
    username: 'janedoe',
    email: 'client@aspeia.com'
  }
]

export default function handler(config, response) {
  // When a POST request is made to /api/jwt/login, return "login"
  // ! These two secrets should be in .env file and not in any other file
  const jwtConfig = {
    secret: process.env.NEXT_PUBLIC_JWT_SECRET,
    expirationTime: process.env.NEXT_PUBLIC_JWT_EXPIRATION,
    refreshTokenSecret: process.env.NEXT_PUBLIC_JWT_REFRESH_TOKEN_SECRET
  }

  if (config.method === 'GET') {
    console.log('GET REQUEST TO /api/auth/me')

    // ** Get token from header
    // @ts-ignore
    const token = config.headers.authorization

    // ** Default set default response to 200
    let defaultResponse = [200, {}]

    // ** Checks if the token is valid or expired
    jwt.verify(token, jwtConfig.secret, (err, decoded) => {
      // ** If token is expired
      if (err) {
        // ** If onTokenExpiration === 'logout' then send 401 error
        if (defaultAuthConfig.onTokenExpiration === 'logout') {
          // ** 401 response will logout user from AuthContext file
          defaultResponse = [401, { error: { error: 'Invalid User' } }]
        } else {
          // ** If onTokenExpiration === 'refreshToken' then generate the new token
          const oldTokenDecoded = jwt.decode(token, { complete: true })

          // ** Get user id from old token
          // @ts-ignore
          const { id: userId } = oldTokenDecoded.payload

          // ** Get user that matches id in token
          const user = users.find(u => u.id === userId)

          // ** Sign a new token
          const accessToken = jwt.sign({ id: userId }, jwtConfig.secret, {
            expiresIn: jwtConfig.expirationTime
          })

          // ** Set new token in localStorage
          window.localStorage.setItem(defaultAuthConfig.storageTokenKeyName, accessToken)
          const obj = { userData: { ...user, password: undefined } }

          // ** return 200 with user data
          defaultResponse = [200, obj]
        }
      } else {
        // ** If token is valid do nothing
        // @ts-ignore
        const userId = decoded.id

        // ** Get user that matches id in token
        const userData = JSON.parse(JSON.stringify(users.find(u => u.id === userId)))
        delete userData.password

        // ** return 200 with user data
        defaultResponse = [200, { userData }]
      }
    })

    response.status(defaultResponse[0]).json(defaultResponse[1])
  } else {
    // Handle any other HTTP method
    response.setHeader('Allow', ['GET'])
    response.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
