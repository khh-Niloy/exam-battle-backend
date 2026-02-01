import { Server } from "socket.io";
import { envVars } from "../../config/env";
import { battleServices } from "./battle.service";

export const initWebSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: {
      origin: envVars.CORS_FRONTEND_URL,
      credentials: true,
    },
  });

  const roomReadyStatus: Record<string, Set<string>> = {};
  const onlineUsers = new Map<string, Set<string>>(); // userId -> Set<socketId>
  const socketUserMap = new Map<string, string>(); // socketId -> userId
  const userStatusMap = new Map<
    string,
    "AVAILABLE" | "IN_LOBBY" | "IN_BATTLE"
  >();

  const updateUserStatus = (
    userId: string,
    status: "AVAILABLE" | "IN_LOBBY" | "IN_BATTLE",
  ) => {
    userStatusMap.set(userId, status);
    io.emit("user_status_updated", { userId, status });
  };

  io.on("connection", (socket) => {
    socket.on("join_self", (userId: string) => {
      socket.join(userId);

      // Online Status Logic
      socketUserMap.set(socket.id, userId);
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
        // Notify everyone this user is online
        io.emit("user_online", { userId });
        userStatusMap.set(userId, "AVAILABLE");
      }
      onlineUsers.get(userId)?.add(socket.id);
    });

    socket.on("get_online_users", () => {
      const usersList = Array.from(onlineUsers.keys()).map((userId) => ({
        userId,
        status: userStatusMap.get(userId) || "AVAILABLE",
      }));
      socket.emit("online_users_list", usersList);
    });

    socket.on("invitation", (data) => {
      const receiverStatus = userStatusMap.get(data.receiverFriendId);
      if (receiverStatus && receiverStatus !== "AVAILABLE") {
        socket.emit("error_message", {
          message:
            "This player is currently in a lobby or battle and cannot be invited.",
        });
        return;
      }
      io.to(data.receiverFriendId).emit("acceptInvitation", data);
    });

    socket.on("accepted", (data) => {
      const { senderUserInfo, acceptedUserInfo } = data;

      if (!senderUserInfo?._id || !acceptedUserInfo?._id) {
        return;
      }

      // Mark both users as busy
      updateUserStatus(senderUserInfo._id, "IN_LOBBY");
      updateUserStatus(acceptedUserInfo._id, "IN_LOBBY");

      const battleRoomId = `battle_${senderUserInfo._id}_${acceptedUserInfo._id}`;

      io.in(acceptedUserInfo._id).socketsJoin(battleRoomId);
      io.in(senderUserInfo._id).socketsJoin(battleRoomId);

      const payload = { ...data, battleRoomId };
      io.to(acceptedUserInfo._id).emit("join_lobby", payload);
      io.to(senderUserInfo._id).emit("join_lobby", payload);
    });

    socket.on(
      "leave_lobby",
      (data: { opponentId: string; battleRoomId: string; selfId: string }) => {
        if (data.opponentId) {
          io.to(data.opponentId).emit("lobby_disbanded");
          updateUserStatus(data.opponentId, "AVAILABLE");
        }

        if (data.selfId) {
          updateUserStatus(data.selfId, "AVAILABLE");
        }

        if (data.battleRoomId) {
          io.in(data.battleRoomId).socketsLeave(data.battleRoomId);
        }
      },
    );

    socket.on("update_arena", (data) => {
      io.to(data.battleRoomId).emit("arena_updated", data);
    });

    // Ready Status Logic

    socket.on(
      "player_ready",
      (data: { battleRoomId: string; userId: string }) => {
        const { battleRoomId, userId } = data;

        if (!roomReadyStatus[battleRoomId]) {
          roomReadyStatus[battleRoomId] = new Set();
        }

        roomReadyStatus[battleRoomId].add(userId);

        // Notify others in room
        socket.to(battleRoomId).emit("opponent_ready", { userId });

        // Check if 2 players are ready
        if (roomReadyStatus[battleRoomId].size >= 2) {
          // Set both players to IN_BATTLE
          // Since we don't have user IDs easily here without more data,
          // we can mark them but ideally we'd pass them in the payload
          io.to(battleRoomId).emit("battle_start", { battleRoomId });

          // Cleanup
          delete roomReadyStatus[battleRoomId];
        }
      },
    );

    socket.on(
      "mark_in_battle",
      (data: { player1: string; player2: string }) => {
        updateUserStatus(data.player1, "IN_BATTLE");
        updateUserStatus(data.player2, "IN_BATTLE");
      },
    );

    socket.on(
      "player_unready",
      (data: { battleRoomId: string; userId: string }) => {
        const { battleRoomId, userId } = data;

        if (roomReadyStatus[battleRoomId]) {
          roomReadyStatus[battleRoomId].delete(userId);

          // Notify others
          socket.to(battleRoomId).emit("opponent_unready", { userId });
        }
      },
    );

    socket.on(
      "submit_answer",
      async (data: {
        battleRoomId: string;
        userId: string;
        progress: any;
        questionPaperId?: string; // Add this to payload in frontend
      }) => {
        socket.to(data.battleRoomId).emit("opponent_progress", data);

        // Check if battle needs to be saved
        // We need a way to track if BOTH have finished.
        // For simplicity, let's track finish state in memory or just check progress
        if (data.progress.left === 0) {
          // One player finished.
          // In a real app, we might wait for both.
          // But to persist, we can check if we have data for both.

          // Better approach for now:
          // When a client detects "Battle Over" (both left=0),
          // one of them (or both) can emit "battle_concluded" event to save it.
          // Or we can track it here.
        }
      },
    );

    socket.on(
      "battle_concluded",
      async (data: {
        battleRoomId: string;
        questionPaperId: string;
        participants: {
          userId: string;
          score: number;
          accuracy: number;
        }[];
      }) => {
        try {
          // Check if already saved? (Optional optimization)
          await battleServices.createBattleResult(
            data.battleRoomId,
            data.questionPaperId,
            data.participants,
          );
          console.log(`>>>> BATTLE SAVED: ${data.battleRoomId}`);
        } catch (error) {
          console.error("Error saving battle:", error);
        }
      },
    );

    socket.on("leave_battle", (data: { userId: string }) => {
      updateUserStatus(data.userId, "AVAILABLE");
    });

    socket.on("disconnect", () => {
      const userId = socketUserMap.get(socket.id);
      if (userId) {
        socketUserMap.delete(socket.id);
        const userSockets = onlineUsers.get(userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            onlineUsers.delete(userId);
            userStatusMap.delete(userId);
            io.emit("user_offline", { userId });
          }
        }
      }
    });
  });

  return io;
};
