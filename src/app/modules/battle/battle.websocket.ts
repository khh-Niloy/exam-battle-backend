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
    socket.on("join_self", (userId: string) => {
      socket.join(userId);
    });

    socket.on("invitation", (data) => {
      io.to(data.receiverFriendId).emit("acceptInvitation", data);
    });

    socket.on("accepted", (data) => {
      const { senderUserInfo, acceptedUserInfo } = data;

      if (!senderUserInfo?._id || !acceptedUserInfo?._id) {
        return;
      }

      const battleRoomId = `battle_${senderUserInfo._id}_${acceptedUserInfo._id}`;

      io.in(acceptedUserInfo._id).socketsJoin(battleRoomId);
      io.in(senderUserInfo._id).socketsJoin(battleRoomId);

      const payload = { ...data, battleRoomId };
      io.to(acceptedUserInfo._id).emit("join_lobby", payload);
      io.to(senderUserInfo._id).emit("join_lobby", payload);
    });

    socket.on(
      "leave_lobby",
      (data: { opponentId: string; battleRoomId: string }) => {
        if (data.opponentId) {
          io.to(data.opponentId).emit("lobby_disbanded");
        }

        if (data.battleRoomId) {
          io.in(data.battleRoomId).socketsLeave(data.battleRoomId);
        }
      },
    );

    socket.on("update_arena", (data) => {
      io.to(data.battleRoomId).emit("arena_updated", data);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  return io;
};
