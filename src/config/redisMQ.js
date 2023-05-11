import redisClient from '../config/initRedis';
import RoomChat from '../models/RoomChat';


export default setRedisMq = async (roomId, val) => {
  try {

    if(await redisClient.lRange(roomId, 0, 1)) {
      await redisClient.rPush(roomId, JSON.stringify(val));
      return;
    }

    
    await redisClient.rPush(roomId, JSON.stringify(val));
    await redisClient.expire(roomId, 60);

    const mqT = setTimeout(async () => {
      try {
        const roomChatMq = await redisClient.lRange(roomId, 0, -1);
        console.log(roomChatMq);
        
        // const foundRoomChat = await RoomChat.findOne({ refRoomId: roomId });
        // foundRoomChat.messages.push(...roomChatMq);
        // await foundRoomChat.save();

        await redisClient.del(roomId);
        clearTimeout(mqT);

      } catch (err) {
        throw err;
      }
    }, 59000)


  } catch (err) {
    throw err;    
  }
}

