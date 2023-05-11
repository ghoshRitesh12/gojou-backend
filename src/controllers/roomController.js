import createHttpError from 'http-errors';
import Room from '../models/Room.js';
import User from '../models/User.js';
import RoomChat from '../models/RoomChat.js';
import Parser from '../api/anime.parser.js';
import { verifyJwt, signJwt } from '../config/jwt.js';
import { encryptState, decryptState } from '../config/cipher.js';
import { socket } from '../server.js';


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
    const src = req.query.src ? decodeURIComponent(req.query.src) : null;
    const room = { data: null };
    const queryFields = [
      'admin', 'mods', 'avatar', 'roomId',
      'animeId','animeEpisodeNo', 'animeEpisodeId'
    ];   

    if(!req.params.roomId) throw createHttpError.BadRequest('Room id required');
    
    const foundRoom = await Room.findOne({ roomId: req.params.roomId }, queryFields);
    if(!foundRoom) throw createHttpError.NotFound('Room not found');


    if(`${foundRoom.admin}` === req.user.id) {
      room.data = req.body;
    } else if(foundRoom.mods.map(i => `${i._id}`).includes(req.user.id)) {
      const { animeId, avatar, ...data } = req.body;
      room.data = data;
    }

    if(!room.data) throw createHttpError.Forbidden();


    for (const key in room.data) {
      if(queryFields.includes(key)) {
        foundRoom[key] = room.data[key];
      }
    }

    await foundRoom.save();

    if(!src) return res.sendStatus(200);

    const eventData = {};
    for (const key in room.data) {
      if(queryFields.includes(key)) {
        eventData[key] = foundRoom[key]
      }
    }

    if(src === 'absent') {
      const animeSrc = await Parser.fetchEpisodeSources(
        foundRoom.animeEpisodeId,
        'vidstreaming', 
        'sub'
      );

      res.sendStatus(200);
      socket.to(foundRoom.roomId).emit('anime:alter', eventData, { episode: animeSrc });
      return;
    }
    
    // changing anime
    const animeSrc = await decryptState(
      decodeURIComponent(src),
      process.env.FRONTEND_STATE_SECRET
    )
    
    res.sendStatus(200);
    socket.to(foundRoom.roomId).emit('anime:alter', eventData, animeSrc);
    return;

  } catch (err) {
    console.log(err);
    next(createHttpError.InternalServerError(err.message));
  }
}
export const updateRoomConfig = async (req, res, next) => {
  try {
    const roomQueryFields = [
      'private', 'mods', 'members', 
      'admin', 'roomId'
    ];
    
    const { visibility, member, drop } = req.query;
    if(!visibility && !member && !drop) throw createHttpError.BadRequest();
    if(!req.params.roomId) throw createHttpError.BadRequest('Room id required');

    const foundRoom = await Room.findOne({ roomId: req.params.roomId }, roomQueryFields);
    if(!foundRoom) throw createHttpError.NotFound('Room not found');

    if(`${foundRoom.admin}` !== req.user.id)
      throw createHttpError.Forbidden('Not authorized');


    // --toggling private
    if(visibility) {
      foundRoom.private = req.body.privacy;
      await foundRoom.save();

      return res.status(200).json({
        message: "Room's privacy changed"
      })
    }

    // --mod promotion or demotion
    if(member) {
      if(!['promote', 'demote'].includes(member))
        throw createHttpError.BadRequest();

      if(!req.body.uid) throw createHttpError.BadRequest();

      const foundUser = await User.findById(req.body.uid, 'relatedRooms');
      if(!foundUser) throw createHttpError.NotFound('User not found');


      if(`${foundRoom.admin}` === `${foundUser._id}`)
        throw createHttpError.BadRequest();

      if(!foundRoom.members.map(i => `${i._id}`).includes(`${foundUser._id}`)) 
        throw createHttpError.Forbidden('Not a member');
      


      if(member === 'promote') {
        foundRoom.mods.push(`${foundUser._id}`);
        await foundRoom.save();

        foundUser.relatedRooms.find(room => (
          `${room.roomId}` === `${foundRoom._id}`
        )).role = 'mod';
        await foundUser.save();

        return res.status(200).json({
          message: 'Promoted member to mod'
        })
      }

      if(member === 'demote') {
        foundRoom.mods = foundRoom.mods.filter(mod => `${mod._id}` !== `${foundUser._id}`);
        await foundRoom.save();

        foundUser.relatedRooms.find(room => (
          `${room.roomId}` === `${foundRoom._id}`
        )).role = 'member';
        await foundUser.save();

        return res.status(200).json({
          message: 'Demoted mod to member'
        })
      } 
    }

    // --removing member
    if(drop) {
      if(!['mod', 'member'].includes(drop))
        throw createHttpError.BadRequest();

      if(!req.body.uid) throw createHttpError.BadRequest();

      const foundUser = await User.findById(req.body.uid, 'relatedRooms');
      if(!foundUser) throw createHttpError.NotFound('User not found');


      if(`${foundRoom.admin}` === `${foundUser._id}`)
        throw createHttpError.BadRequest();

      if(!foundRoom.members.map(i => `${i._id}`).includes(`${foundUser._id}`)) 
        throw createHttpError.Forbidden('Not a member');


      foundRoom.members = foundRoom.members.filter(member => (
        `${member._id}` !== `${foundUser._id}`
      ))

      foundUser.relatedRooms = foundUser.relatedRooms.filter(room => (
        `${room.roomId}` !== `${foundRoom._id}`
      ))

      await foundUser.save();

      if(drop === 'mod') {
        foundRoom.mods = foundRoom.mods.filter(mod => (
          `${mod._id}` !== `${foundUser._id}`
        ))
      }
      await foundRoom.save();

      res.status(200).json({
        message: `Removed ${drop} from room`
      });

      console.log("member:remove roomID ", foundRoom.roomId);
      socket.to(foundRoom.roomId).emit("member:remove", foundUser.email)

    }

  } catch (err) {
    console.log(err);
    next(err);
  }
}

// :as a member 
export const joinRoom = async (req, res, next) => {
  try {
    if(!req.params.roomId) throw createHttpError.BadRequest('Room id required');

    const foundRoom = await Room.findOne({ roomId: req.params.roomId });
    if(!foundRoom) throw createHttpError.NotFound('Room not found');
    
    if(`${foundRoom.admin}` === req.user.id) 
      throw createHttpError.BadRequest();
    
    if(foundRoom.members.map(i => `${i._id}`).includes(req.user.id)) {
      return res.status(200).json({
        message: 'Already part of the room',
        redirectTo: `/room/${foundRoom.roomId}`
      })
    }
      
    foundRoom.members.push(req.user.id)
    await foundRoom.save();


    const foundUser = await User.findById(req.user.id, 'relatedRooms');

    if(foundUser.relatedRooms.map(i => `${i.roomId}`).includes(foundRoom._id)) {
      return res.status(200).json({
        message: 'Already part of the room',
        redirectTo: `/room/${foundRoom.roomId}`
      })
    }
    
    foundUser.relatedRooms.push({ roomId: foundRoom._id });
    await foundUser.save()

    res.status(200).json({
      message: 'Joined room 🎉',
      redirectTo: `/room/${foundRoom.roomId}`
    })

  } catch (err) {
    next(err);
  }
}
export const leaveRoom = async (req, res, next) => {
  try {
    if(!req.params.roomId) throw createHttpError.BadRequest('Room id required');

    const foundRoom = await Room.findOne({ roomId: req.params.roomId });
    if(!foundRoom) throw createHttpError.NotFound('Room not found');
    
    if(`${foundRoom.admin}` === req.user.id) 
      throw createHttpError.BadRequest();
    
    if(!foundRoom.members.map(i => `${i._id}`).includes(req.user.id))
      throw createHttpError.NotFound('Member not found');

    if(foundRoom.mods.map(i => `${i._id}`).includes(req.user.id)) {
      foundRoom.mods = foundRoom.mods.filter(mod => `${mod._id}` !== req.user.id);
    }
    foundRoom.members = foundRoom.members.filter(member => `${member._id}` !== req.user.id);
    await foundRoom.save();

    console.log(foundRoom);

    const foundUser = await User.findById(req.user.id, 'relatedRooms');
    foundUser.relatedRooms = foundUser.relatedRooms.filter(room => (
      `${room.roomId}` !== `${foundRoom._id}`
    ))
    console.log(foundUser);

    await foundUser.save();

    res.status(200).json({
      message: 'Left room'
    })

  } catch (err) {
    next(err);
  }
}
export const deleteRoom = async (req, res, next) => {
  try {
    if(!req.params.roomId) throw createHttpError.BadRequest('Room id required');

    const foundRoom = await Room.findOne({ roomId: req.params.roomId }, ['_id', 'admin']);
    if(!foundRoom) throw createHttpError.NotFound('Room not found');
    
    if(`${foundRoom.admin}` !== req.user.id) 
      throw createHttpError.Forbidden();
    

    const adminUser = await User.findById(req.user.id, 'createdRooms');
    adminUser.createdRooms = adminUser.createdRooms.filter(room => (
      `${room._id}` !== `${foundRoom._id}`
    ))

    await adminUser.save();

    await User.updateMany(
      { relatedRooms: { $elemMatch: { roomId: foundRoom._id } } },
      { $pull: { relatedRooms: { roomId: foundRoom._id } } }
    )

    await Room.deleteOne({ _id: foundRoom._id });

    res.status(200).json({
      message: 'Deleted room'
    })
    

  } catch (err) {
    console.log(err);
    next(err);
  }
}


export const getRoomChat = async (req, res, next) => {
  const userQueryFields = ['name', 'profilePicture'];
  const roomQueryFields = ['private', 'members'];  
  try {
    const info = {
      role: 'viewer',
      roomChat: null
    }

    if(!req.params.roomId) throw createHttpError.BadRequest('Room id required');

    const foundRoom = await Room.findOne({ roomId: req.params.roomId }, roomQueryFields);
    if(!foundRoom) throw createHttpError.NotFound('Room not found');

    const foundRoomChat = await RoomChat.findOne({ refRoomId: req.params.roomId });
    if(!foundRoomChat) throw createHttpError.NotFound('Room chat not found');


    if(foundRoom.members.includes(req.user.id)) {
      info.role = 'room_member';
    }

    if(foundRoom.private && info.role === 'viewer') 
      throw createHttpError.Forbidden();

    info.roomChat = await foundRoomChat.populate({
      path: 'messages.sender', select: userQueryFields
    });

    res.status(200).json(info);

    info.roomChat = null;

  } catch (err) {
    next(err);
  }
}


export const setRoomChat = async (req, res, next) => {
  try {
    const info = {
      role: 'viewer',
    }

    if(!req.params.roomId) throw createHttpError.BadRequest('Room id required');

    const foundRoom = await Room.findOne({ roomId: req.params.roomId }, roomQueryFields);
    if(!foundRoom) throw createHttpError.NotFound('Room not found');

    const foundRoomChat = await RoomChat.findOne({ refRoomId: req.params.roomId });
    if(!foundRoomChat) throw createHttpError.NotFound('Room chat not found');

    

  } catch (err) {
    next(err);
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

    // already a member
    if(foundRoom.members.map(i => `${i._id}`).includes(req.user.id)) {
      return res.status(200).json({
        message: 'Already part of the room',
        redirectTo: `/room/${foundRoom.roomId}`
      })
    }
    
    foundRoom.members.push(req.user.id);
    await foundRoom.save();


    const foundUser = await User.findById(req.user.id, 'relatedRooms');

    if(foundUser.relatedRooms.map(i => `${i.roomId}`).includes(foundRoom._id)) {
      return res.status(200).json({
        message: 'Already part of the room',
        redirectTo: `/room/${foundRoom.roomId}`
      })
    }
    
    foundUser.relatedRooms.push({ roomId: foundRoom._id });
    await foundUser.save()

    res.status(200).json({
      message: 'Joined room 🎉',
      redirectTo: `/room/${foundRoom.roomId}`
    })

  } catch (err) {
    console.log(err);
    next(err.message)
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

    const inviteLink = `${process.env.FRONTEND_DEV_BASE_URL}/room/invite/${inviteToken}`;
    
    res.status(200).json({
      message: 'Fetched new invite token',
      inviteLink
    })

  } catch (err) {
    console.log(err);
    next(err);
  }
}


export const roomInit = async (req, res, next) => {
  const queryFields = [
    'name', 'roomId', 'avatar', 'private',
    'admin', 'mods', 'members', 'createdAt',
    'animeId', 'animeEpisodeId', 'animeEpisodeNo'
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

    info.room = foundRoom;

    const encData = await encryptState(
      info, process.env.FRONTEND_STATE_SECRET
    );

    return res.status(200).json({
      initData: encData
    })

    

  } catch (err) {
    console.log(err);
    next(err);
  }
} 

