function alreadyLoggedIn (req, res, next) {
  const accessCookie = req.cookies?.access_token;
  const refreshCookie = req.cookies?.refresh_token;
  !accessCookie && !refreshCookie ? next() : res.redirect('back');
}

export default alreadyLoggedIn;
