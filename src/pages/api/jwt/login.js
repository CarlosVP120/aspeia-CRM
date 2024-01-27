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
    console.log('LOGIN REQUEST TO /api/jwt/login')
    const { email, password } = request.body

    let error = {
      email: ['Something went wrong']
    }
    const user = users.find(u => u.email === email && u.password === password)
    if (user) {
      const accessToken = jwt.sign({ id: user.id }, jwtConfig.secret, { expiresIn: jwtConfig.expirationTime })

      const responseData = {
        accessToken,
        userData: { ...user, password: undefined }
      }

      response.status(200).json(responseData)
    } else {
      error = {
        email: ['email or Password is Invalid']
      }

      response.status(400).json({ error })
    }
  } else {
    // Handle any other HTTP method
    response.setHeader('Allow', ['POST'])
    response.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
