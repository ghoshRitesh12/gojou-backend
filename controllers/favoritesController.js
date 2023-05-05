import createHttpError from "http-errors";
import User from "../models/User.js";
import FavoriteAnime from "../models/FavoriteAnime.js";


export const addFavoriteAnime = async (req, res, next) => {
  try {
    const foundUser = await User.findById(req.user.id);

    const foundAnime = await FavoriteAnime.findOne({ id: req.body.id }, '_id');
    if(foundAnime) {
      const allFavAnimes = [...foundUser.favoriteAnimes, foundAnime._id];
      foundUser.favoriteAnimes = allFavAnimes;
      await foundUser.save()

      res.status(201).json({
        message: 'Added to favorites'
      });
      return;
    }
    
    const newFavoriteAnime = await FavoriteAnime.create(req.body);
    const allFavAnimes = [...foundUser.favoriteAnimes, newFavoriteAnime._id];
    foundUser.favoriteAnimes = allFavAnimes;
    await foundUser.save()

    res.status(201).json({
      message: 'Added to favorites'
    });

  } catch (err) {
    next(createHttpError.InternalServerError(err.message));
  }
}

export const getAllFavoriteAnime = async (req, res, next) => {
  try {
    const foundUser = await User.findById(req.user.id, 'favoriteAnimes');
    const allFavAnimes = (await foundUser.populate('favoriteAnimes')).favoriteAnimes;

    res.status(200).json({
      favAnimes: allFavAnimes
    })

  } catch (err) {
    next(createHttpError.InternalServerError(err.message));
  }
}

export const isFavoriteAnime = async (req, res, next) => {
  try {
    const animeId = req.params.animeId;
    if(!animeId) throw createHttpError.BadRequest();

    const foundUser = await User.findById(req.user.id, 'favoriteAnimes');

    const foundFavAnime = (await foundUser.populate({
      path: 'favoriteAnimes', select: '_id',
      match: { id: animeId }
    })).favoriteAnimes

    
    if(foundFavAnime.length < 1) 
      throw createHttpError.NotFound('favorite anime absent');
    
    res.sendStatus(200);

  } catch (err) {
    next(err);
  }
}

export const removeFavoriteAnime = async (req, res, next) => {
  try {
    const animeId = req.params.animeId;
    if(!animeId) throw createHttpError.BadRequest();

    const foundUser = await User.findById(req.user.id, 'favoriteAnimes');
    const allFavAnimesId = foundUser.favoriteAnimes.map(anime => `${anime._id}`)

    const foundFavAnime = (await User.findById(req.user.id, 'favoriteAnimes').populate({
      path: 'favoriteAnimes', select: 'id',
      match: { id: animeId }
    })).favoriteAnimes;

    if(foundFavAnime.length < 1)
      throw createHttpError.NotFound('favorite anime absent');

    foundUser.favoriteAnimes = allFavAnimesId.filter(animeId => {
      return `${foundFavAnime[0]._id}` !== animeId
    })
    await foundUser.save();

    res.status(200).json({
      message: 'Removed from favorites'
    });

  } catch (err) {
    next(createHttpError.InternalServerError(err.message));
  }
}

