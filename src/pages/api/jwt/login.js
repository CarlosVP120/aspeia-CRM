// ** JWT import
import jwt from 'jsonwebtoken'
import supabase from 'src/@core/utils/supabase'

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
  },
  {
    id: 3,
    role: 'user',
    password: 'user1',
    fullName: 'Will Smith',
    username: 'willsmith',
    email: 'user@aspeia.com'
  }
]

const loginToSupabase = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  return { data, error }
}

const upsertUser = async user => {
  const { data, error } = await supabase.from('users').upsert(user).select()

  return { data, error }
}

export default async function handler(request, response) {
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

    // const user = users.find(u => u.email === email && u.password === password)

    // Get the user from supabase
    const loginData = await loginToSupabase(email, password)

    if (loginData) {
      const user = loginData.data.user

      // Get the role from the custom_user_data table and add it to the user object
      const { data: customUserData, error } = await supabase.from('custom_user_data').select().eq('user_id', user.id)

      const accessToken = jwt.sign({ id: user.id }, jwtConfig.secret, { expiresIn: jwtConfig.expirationTime })

      const responseData = {
        accessToken,
        userData: { ...user, password: undefined, ...customUserData[0] }
      }

      console.log('responseDataLogin', responseData)

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
