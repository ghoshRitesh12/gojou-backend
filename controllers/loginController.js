import createHttpError from "http-errors";


export const handleLogin = async (req, res, next) => {
  try {
    res.send('login mf');
  } catch (err) {
    next(err);
  }
}