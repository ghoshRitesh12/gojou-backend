import { Server } from 'socket.io';


export const initSocketIo = (server) => {
  const io = new Server(server, {
    cookie: true,
    cors: {
      origin: [
        process.env.FRONTEND_DEV_BASE_URL, 
        process.env.FRONTEND_PROD_BASE_URL
      ]
    }
  });
  
  const socket = io.on('connection', socket => {


    socket.on('room:join', (userName, roomId) => {
      if(!roomId) return;
      console.log(roomId);
      
      socket.join(roomId)

      const greet = `${userName} has entered the room`;
      socket.to(roomId).emit('room:enter', greet);

      socket.emit("room:member-alter", socket.rooms.size)
    })


    socket.on("room:exit", (roomId, name) => {
      const msg = `${name} has left the room`;
      socket.to(roomId).emit("room:leave", msg);

      console.log(roomId, name);
      socket.disconnect(true)
    })

    socket.on("room:exit-permanently", (roomId) => {
      socket.leave(roomId)
      socket.disconnect(true);
    })

    return socket;
  })

  return socket;
}
