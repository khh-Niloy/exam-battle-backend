import { Types } from "mongoose";
import { Battle } from "./battle.model";
import { IBattle, IBattleParticipant } from "./battle.interface";

const createBattleResult = async (
  battleRoomId: string,
  questionPaperId: string,
  participantsData: {
    userId: string;
    score: number;
    accuracy: number;
  }[],
) => {
  // Check if battle already exists to prevent duplicates
  const existingBattle = await Battle.findOne({ battleRoomId });
  if (existingBattle) {
    return existingBattle;
  }

  // Sort by score descending to find winner
  // If scores are equal, maybe accuracy? For now just score.
  const sorted = [...participantsData].sort((a, b) => b.score - a.score);

  const p1 = sorted[0];
  const p2 = sorted[1];

  let isDraw = false;
  let winnerId: Types.ObjectId | null = null;

  if (p1.score === p2.score) {
    isDraw = true;
  } else {
    winnerId = new Types.ObjectId(p1.userId);
  }

  const participants: IBattleParticipant[] = participantsData.map((p) => {
    let result: "win" | "loss" | "draw" = "draw";
    if (!isDraw) {
      if (p.userId === p1.userId) result = "win";
      else result = "loss";
    }

    return {
      userId: new Types.ObjectId(p.userId),
      score: p.score,
      accuracy: p.accuracy,
      result,
    };
  });

  const battle = await Battle.create({
    battleRoomId,
    questionPaperId: new Types.ObjectId(questionPaperId),
    participants,
    winner: winnerId,
    isDraw,
  });

  return battle;
};

const getBattleHistory = async (userId: string) => {
  const battles = await Battle.find({
    "participants.userId": new Types.ObjectId(userId),
  })
    .sort({ createdAt: -1 })
    .populate("questionPaperId", "examName subject")
    .populate("participants.userId", "name image")
    .populate("winner", "name");

  return battles;
};

export const battleServices = {
  createBattleResult,
  getBattleHistory,
};
