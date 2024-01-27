// ** JWT import
import jwt from 'jsonwebtoken'

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

export default function handler(request, response) {
  // When a POST request is made to /api/jwt/login, return "login"
  // ! These two secrets should be in .env file and not in any other file
  const jwtConfig = {
    secret: process.env.NEXT_PUBLIC_JWT_SECRET,
    expirationTime: process.env.NEXT_PUBLIC_JWT_EXPIRATION,
    refreshTokenSecret: process.env.NEXT_PUBLIC_JWT_REFRESH_TOKEN_SECRET
  }

  if (request.method === 'POST') {
    console.log('REGISTER REQUEST TO /api/jwt/register')
    console.log(request.body)
    if (request.body) {
      const { email, password, username } = request.body
      const isEmailAlreadyInUse = users.find(user => user.email === email)
      const isUsernameAlreadyInUse = users.find(user => user.username === username)

      const error = {
        email: isEmailAlreadyInUse ? 'This email is already in use.' : null,
        username: isUsernameAlreadyInUse ? 'This username is already in use.' : null
      }

      if (!error.username && !error.email) {
        const { length } = users
        let lastIndex = 0
        if (length) {
          lastIndex = users[length - 1].id
        }

        const userData = {
          id: lastIndex + 1,
          email,
          password,
          username,
          avatar: null,
          fullName: '',
          role: 'admin'
        }
        users.push(userData)
        const accessToken = jwt.sign({ id: userData.id }, jwtConfig.secret)
        const user = { ...userData }
        delete user.password
        const responseData = { accessToken }

        response.status(200).json(responseData)

        // End the process
        return
      }

      response.status(200).json({ error })
    } else {
      response.status(401).json({ error: 'Invalid data' })
    }
  } else {
    // Handle any other HTTP method
    response.setHeader('Allow', ['POST'])
    response.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
