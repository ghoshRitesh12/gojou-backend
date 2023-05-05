import createHttpError from 'http-errors';
import Parser from '../api/anime.parser.js';
import Room from '../models/Room.js';
import User from '../models/User.js';
import { signJwt } from '../config/jwt.js';
import gojou from '../config/gojou.js';

const setMembers = (rooms) => {
  return rooms.map(room => {
    const { _id, ...restData } = {
      ...room._doc,
      members: room._doc.members.length
    }
    return restData
  })
}


export const createRoom = async (req, res, next) => {
  try {
    const roomData = {
      ...req.body,
      admin: req.user.id,
      members: [req.user.id],
    }

    const { episodes } = await Parser.scrapeAnimeEpisodes(roomData.animeId);
    roomData.animeEpisodeId = episodes[0].id;
    
    const newRoom = await Room.create(roomData);
    const foundUser = await User.findById(req.user.id, ['createdRooms', 'relatedRooms']);
    foundUser.createdRooms = [...foundUser.createdRooms, `${newRoom._id}`];
    await foundUser.save();

    const inviteToken = await signJwt(
      { roomId: `${newRoom.roomId}` },
      process.env.ROOM_INVITE_TOKEN_SECRET,
      '55m'
    )

    const roomInviteLink = `${process.env.FRONTEND_BASE_URL}/room/invite/${inviteToken}`
    console.log(roomInviteLink);

    res.status(201).json({
      message: 'Created room successfully 🎉',
      inviteLink: roomInviteLink
    })

  } catch (err) {
    console.log(err);

    if(err.message.includes('invalid')) {
      next(createHttpError.BadRequest('Room name is invalid, try again'));
      return;
    }

    if(err.code === 11000) {
      next(createHttpError.Conflict('Room name already exists'))
      return; 
    }

    next(createHttpError.InternalServerError(err.message));
  }
}

export const getOwnRooms = async (req, res, next) => {
  try {

    const foundUser = await User.findById(req.user.id, 'createdRooms');

    const createdRooms = (await foundUser.populate({
      path: 'createdRooms', select: ['name', 'roomId']
    })).createdRooms;


    res.status(200).json({
      createdRooms
    })

  } catch (err) {
    console.log(message);
    next(createHttpError.InternalServerError(err.message));
  }
}

export const browseRooms = async (req, res, next) => {
  const roomQueryFields = [
    'name', 'avatar', 'members', 
    'roomId', 'admin', 'createdAt'
  ];
  const userQueryFields = [
    'name', 'profilePicture',
    'createdRooms', 'relatedRooms'
  ]
  try {
    const data = {
      createdRooms: [],
      relatedRooms: [],
      publicRooms: [],
    }

    data.publicRooms = setMembers(await Room.find({ private: false }, roomQueryFields).populate({ 
      path: 'admin', select: ['name', 'profilePicture'] 
    }))

    if(req.user) {
      const foundUser = await User.findById(req.user.id, userQueryFields);

      data.createdRooms = setMembers((await foundUser.populate({
        path: 'createdRooms', select: roomQueryFields,
        populate: { path: 'admin', select: ['name', 'profilePicture'] }
      })).createdRooms);

      data.relatedRooms = setMembers(((await foundUser.populate({
        path: 'relatedRooms.roomId', select: roomQueryFields,
        populate: { path: 'admin', select: ['name', 'profilePicture'] }
      })).relatedRooms).map(i => i.roomId));

    }

    await gojou.emitEncrypt(
      'anime:alter', 
      {
        msg: 'dummy data lmao'
      }
    )

    return res.status(200).json(data);

  } catch (err) {
    console.log(err);
    next(createHttpError.InternalServerError(err.message));
  }
}

