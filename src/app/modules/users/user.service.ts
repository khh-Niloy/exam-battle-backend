import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { IUser, Roles } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from "bcryptjs";
import { jwtManagement } from "../../utils/jwtManagement";

const createUserService = async (playLoad: Partial<IUser>) => {
  const { email, password, ...rest } = playLoad;

  const userEmail = email?.toLowerCase().trim();

  const isUserExist = await User.findOne({ email: userEmail });
  if (isUserExist) {
    throw new Error("User already exist");
  }

  const hashedPassword = await bcryptjs.hash(
    password as string,
    Number(envVars.BCRYPT_SALT_ROUND),
  );

  const generateUniqueCode = (name: string) => {
    const cleanName = name.replace(/\s+/g, "").toUpperCase().slice(0, 6);
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `${cleanName}#${randomDigits}`;
  };

  const code = generateUniqueCode(rest.name || "USER");

  const userData = {
    email: userEmail,
    password: hashedPassword,
    uniqueNameCode: code,
    friends: [],
    friendRequests: [],
    ...rest,
  };

  const newCreatedUser = await User.create(userData);
  const userWithoutPassword = await User.findById(newCreatedUser._id);

  const jwtPayload = {
    userId: newCreatedUser._id,
    email: newCreatedUser.email,
    role: newCreatedUser.role,
  };

  const { accessToken, refreshToken } =
    jwtManagement.createAccessAndRefreshToken(jwtPayload);

  return { accessToken, refreshToken, user: userWithoutPassword };
};

const getProfileService = async (userInfo: JwtPayload) => {
  const profile = await User.findById(userInfo.userId);
  return profile;
};

const searchUserByCodeService = async (code: string) => {
  console.log("code", code);
  let query: any = {
    uniqueNameCode: { $regex: code, $options: "i" },
  };

  // Check if it's a valid ObjectId to support search by ID
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(code);
  if (isObjectId) {
    query = { _id: code };
  }

  // Also try exact match for the code part if the user typed it without correct casing for name
  // This is handled by the regex 'i' flag but just to be safe

  let user = await User.findOne(query).select(
    "name uniqueNameCode image studentInfo",
  );

  // Fallback: If no user found, try to search by just the unique code numbers if the user only entered that?
  // No, that might be too loose.

  return user;
};

const sendFriendRequestService = async (
  senderId: string,
  receiverCode: string,
) => {
  let receiver;

  // Check if it's a valid ObjectId to support search by ID
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(receiverCode);
  if (isObjectId) {
    receiver = await User.findById(receiverCode);
  } else {
    receiver = await User.findOne({
      uniqueNameCode: { $regex: new RegExp(`^${receiverCode}$`, "i") },
    });
  }

  if (!receiver) {
    throw new Error("User not found");
  }

  if (receiver._id.toString() === senderId) {
    throw new Error("You cannot send a friend request to yourself");
  }

  // Check if they are already friends
  const sender = await User.findById(senderId);
  if (sender?.friends.includes(receiver._id)) {
    throw new Error("You are already friends");
  }

  // Check if a request is already sent
  if (receiver.friendRequests.includes(senderId as any)) {
    throw new Error("Friend request already sent");
  }

  receiver.friendRequests.push(senderId as any);
  await receiver.save();

  return { message: "Friend request sent successfully" };
};

const getPendingRequestsService = async (userId: string) => {
  const user = await User.findById(userId).populate(
    "friendRequests",
    "name uniqueNameCode image",
  );
  return user?.friendRequests || [];
};

const acceptFriendRequestService = async (userId: string, senderId: string) => {
  const user = await User.findById(userId);
  const sender = await User.findById(senderId);

  if (!user || !sender) {
    throw new Error("User not found");
  }

  // Remove from pending
  user.friendRequests = user.friendRequests.filter(
    (id) => id.toString() !== senderId,
  );

  // Add to friends for both
  if (!user.friends.includes(senderId as any)) {
    user.friends.push(senderId as any);
  }
  if (!sender.friends.includes(userId as any)) {
    sender.friends.push(userId as any);
  }

  await user.save();
  await sender.save();

  return { message: "Friend request accepted" };
};

const rejectFriendRequestService = async (userId: string, senderId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Remove from pending
  user.friendRequests = user.friendRequests.filter(
    (id) => id.toString() !== senderId,
  );
  await user.save();

  return { message: "Friend request rejected" };
};

const getFriendsService = async (userId: string) => {
  const user = await User.findById(userId).populate(
    "friends",
    "name uniqueNameCode image",
  );
  return user?.friends || [];
};

const getAllUsersService = async (role?: Roles) => {
  const query = role ? { role } : {};
  return await User.find(query).select("+status");
};

const toggleUserBlockStatusService = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  user.status = user.status === "blocked" ? "active" : "blocked";
  await user.save();
  return user;
};

export const userServices = {
  createUserService,
  getProfileService,
  getFriendsService,
  searchUserByCodeService,
  sendFriendRequestService,
  getPendingRequestsService,
  acceptFriendRequestService,
  rejectFriendRequestService,
  getAllUsersService,
  toggleUserBlockStatusService,
};
