
export const handleLogout = async (req, res, next) => {
  try {

    res.clearCookie(
      'refresh_token',
      { 
        httpOnly: true, secure: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,  
        // maxAge: 40 * 1000,  
      }
    )
    res.clearCookie(
      'access_token',
      { 
        httpOnly: true, secure: true,
        // maxAge: 25 * 1000,  
        maxAge: 30 * 60 * 1000,  
      }
    )

    res.sendStatus(204);
    
  } catch (err) {
    console.log(err);
    next(err);
  }
}