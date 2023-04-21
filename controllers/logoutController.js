
export const handleLogout = async (req, res, next) => {
  try {

    res.clearCookie(
      'refresh_token',
      { 
        httpOnly: true, secure: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,  
      }
    )
    res.clearCookie(
      'access_token',
      { 
        httpOnly: true, secure: true,
        maxAge: 30 * 60 * 1000,  
      }
    )

    res.status(200).json({
      message: 'logout success',
      redirectTo: process.env.FRONTEND_BASE_URL
    })
    
  } catch (err) {
    console.log(err);
    next(err);
  }
}