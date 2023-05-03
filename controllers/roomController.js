import createHttpError from 'http-errors';
import Room from '../models/Room.js';
import User from '../models/User.js';
import { verifyJwt, signJwt } from '../config/jwt.js';

const isPresent = (key, src) => src.map(i => `${i._id}`).includes(key)


export const getRoomInfo = async (req, res, next) => {
  const queryFields = [
    'name', 'roomId', 'avatar', 'private',
    'admin', 'mods', 'members', 'animeId', 
    'createdAt'
  ];
  try {
    const info = {
      role: 'viewer',
      room: null
    }

    if(!req.params.roomId) throw createHttpError.BadRequest('Room id required');

    const foundRoom = await Room.findOne({ roomId: req.params.roomId }, queryFields);
    if(!foundRoom) throw createHttpError.NotFound('Room not found');

    // filtering admin & mods from all members
    const nonMemberSrc = [...foundRoom.mods.map(i => `${i._id}`), `${foundRoom.admin}`];
    foundRoom.members = foundRoom.members.filter(i => !nonMemberSrc.includes(`${i._id}`));

    if(`${foundRoom.admin}` === req.user.id) {
      info.role = 'admin';
    } else if(foundRoom.mods.map(i => `${i._id}`).includes(req.user.id)) {
      info.role = 'mod';
    } else if(foundRoom.members.includes(req.user.id)) {
      info.role = 'member';
    }

    if(foundRoom.private && info.role === 'viewer') 
      throw createHttpError.Forbidden();

    info.room = await foundRoom.populate({
      path: 'admin mods members', select: ['name', 'profilePicture']
    });

    res.status(200).json(info);

    info.room = null;

  } catch (err) {
    next(err);
  }
}

export const updateRoomAnime = async (req, res, next) => {
  try {
    const room = { data: null };
    const queryFields = [
      'admin', 'mods', 'avatar', 
      'animeId','animeEpisodeNo', 'animeEpisodeId'
    ];   

    if(!req.params.roomId) throw createHttpError.BadRequest('Room id required');
    
    const foundRoom = await Room.findOne({ roomId: req.params.roomId }, queryFields);
    if(!foundRoom) throw createHttpError.NotFound('Room not found');


    if(`${foundRoom.admin}` === req.user.id) {
      room.data = req.body;
    } else if(foundUser.mods.map(i => `${i._id}`).includes(req.user.id)) {
      const { animeId, avatar, ...data } = req.body;
      room.data = data;
    }

    if(!room.data) throw createHttpError.Unauthorized();


    for (const key in room.data) {
      if(queryFields.includes(key)) {
        foundRoom[key] = room.data[key];
      }
    }

    await foundRoom.save();

    res.sendStatus(200);


  } catch (err) {
    console.log(err);
    next(createHttpError.InternalServerError(err.message));
  }
}

export const updateRoomConfig = async (req, res, next) => {
  try {
    const queryFields = ['private', 'mods', 'members'];
    
    const { visibility, member, drop } = req.query;
    if(!req.params.roomId) throw createHttpError.BadRequest('room id required');

    const foundRoom = await Room.findOne({ roomId: req.params.roomId }, queryFields);
    if(!foundRoom) throw createHttpError.NotFound('room not found');

    if(visibility) {
      foundRoom.private = req.body.privacy;
      await foundRoom.save();

      res.status(200).json({
        message: "Room's privacy changed"
      })
      return;
    }

    // visibility --for toggling private
    // member --for mod promotion or demotion
    // drop --for delete

  } catch (err) {
    console.log(err);
    next(createHttpError.InternalServerError(err.message));
  }
}

export const handleRoomInvitation = async (req, res, next) => {
  try {
    const { roomToken } = req.params;

    if(!roomToken) throw createHttpError.BadRequest('invite token required')

    const { roomId } = await verifyJwt(
      roomToken,
      process.env.ROOM_INVITE_TOKEN_SECRET
    )
    if(!roomId) throw createHttpError.Forbidden();


    const foundRoom = await Room.findOne({ roomId: roomId });
    if(!foundRoom) throw createHttpError.NotFound('Room not found');
    console.log(foundRoom);


    // if(foundRoom.members.map(i => `${i._id}`).includes(req.user.id))
    //   throw createHttpError.Conflict('You are already a part of the room');

    
    foundRoom.members.push(req.user.id);
    await foundRoom.save();


    // if(!foundUser.relatedRooms.map(i => `${i._id}`).includes(foundRoom._id)) 
    //   throw createHttpError.Conflict();
    
    const foundUser = await User.findById(req.user.id, 'relatedRooms');
    foundUser.relatedRooms.push({
      roomId: foundRoom._id
    })

    await foundUser.save()

    res.json({
      message: 'Joined room 🎉',
      redirectTo: `/room/${foundRoom.roomId}`
    })

  } catch (err) {
    console.log(err);
    next(createHttpError.InternalServerError(err.message))
  }
}

export const genRoomInviteToken = async (req, res, next) => {
  try {
    const queryFields = ['roomId', 'members'];

    if(!req.params.roomId) throw createHttpError.BadRequest('room id required');

    const foundRoom = await Room.findOne({ roomId: req.params.roomId }, queryFields);
    if(!foundRoom) throw createHttpError.NotFound('room not found');

    if(!foundRoom.members.map(i => `${i._id}`).includes(req.user.id))
      throw createHttpError.Forbidden();

    const inviteToken = await signJwt(
      { roomId: `${foundRoom.roomId}` },
      process.env.ROOM_INVITE_TOKEN_SECRET,
      '55m'
    )

    const inviteLink = `${process.env.FRONTEND_BASE_URL}/room/invite/${inviteToken}`;
    
    res.status(200).json({
      message: 'Fetched new invite token',
      inviteLink
    })

  } catch (err) {
    console.log(err);
    next(err);
  }
}


export const getRoom = async (req, res, next) => {
  try {
    res.send('hi');
  } catch (err) {
    console.log(err);
    next(createHttpError.InternalServerError(err.message));    
  }
} 

