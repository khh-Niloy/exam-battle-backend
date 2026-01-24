import { Server } from "socket.io";
import { envVars } from "../../config/env";

export const initWebSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: {
      origin: envVars.CORS_FRONTEND_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected");
    socket.on("join_self", (userId: string) => {
      console.log("join_self", userId);
      socket.join(userId);
    });

    socket.on("invitation", (data) => {
      console.log("invitation", data);
      io.to(data.receiverFriendId).emit("acceptInvitation", data);
    });

    socket.on("accepted", (data) => {
      console.log("accepted", data);

      const { senderUserInfo, acceptedUserInfo } = data;

      if (!senderUserInfo?._id || !acceptedUserInfo?._id) {
        console.error("❌ Missing user info in accepted event:", data);
        return;
      }

      // Create a specific battle lobby room for future events
      const battleRoomId = `battle_${senderUserInfo._id}_${acceptedUserInfo._id}`;
      socket.join(battleRoomId);

      // Emit 'join_lobby' to both players' private rooms
      io.to(acceptedUserInfo._id).emit("join_lobby", data);
      io.to(senderUserInfo._id).emit("join_lobby", data);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  return io;
};
