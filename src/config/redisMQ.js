import redisClient from './initRedis.js';
import RoomChat from '../models/RoomChat.js';


export const readqueue = async (roomId) => {
  roomId = `chat_${roomId}`;
  try {
    if(await redisClient.exists(roomId)) {
      const roomChats = (
        await redisClient.lRange(roomId, 0, -1)
      ).map(i => JSON.parse(i))

      return roomChats;
    }
    return null;

  } catch (err) {
    throw err;    
  }
}


export const enqueue = async (roomId, val = {}) => {
  roomId = `chat_${roomId}`;
  try {
    const info = {
      text: val.chatData.text,
      sender: {
        _id: val.chatData.sender,
        name: val.extraData.name,
        profilePicture: val.extraData.pfp,
      },
      timestamp: val.chatData.timestamp 
    }

    if(await redisClient.exists(roomId)) {
      await redisClient.rPush(roomId, JSON.stringify(val.chatData));
      return info;
    }

    
    await redisClient.rPush(roomId, JSON.stringify(val.chatData));
    
    const enqTimeout = setTimeout(async () => {
      try {
        const roomChats = await redisClient.lRange(roomId, 0, -1);
        console.log(roomChats);

        const foundRoomChat = await RoomChat.findOne({ refRoomId: roomId.split("_")[1] });
        foundRoomChat.messages.push(...roomChats.map(i => JSON.parse(i)));
        await foundRoomChat.save();

        await redisClient.del(roomId);
        clearTimeout(enqTimeout);

      } catch (err) {
        throw err;
      }
    }, 20000)

    return info;

  } catch (err) {
    throw err;    
  }
}

