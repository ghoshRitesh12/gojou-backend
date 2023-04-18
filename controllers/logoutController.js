import createHttpError from "http-errors";


export const handleLogout = async (req, res, next) => {
  try {

    res.clearCookie(
      'refresh_token',
      { 
        httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000, 
        secure: true 
      }
    )
    res.clearCookie(
      'access_token',
      { 
        httpOnly: true, maxAge: 30 * 60 * 1000, 
        secure: true 
      }
    )

    res.redirect(`${process.env.FRONTEND_BASE_URL}/`)
    
  } catch (err) {
    console.log(err);
    next(err);
  }
}