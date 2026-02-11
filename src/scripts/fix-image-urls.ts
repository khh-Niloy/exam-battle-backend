import { connectMongoose } from "../app/lib/connectMongoose";
import { User } from "../app/modules/users/user.model";
import mongoose from "mongoose";

const fixImageUrls = async () => {
  try {
    await connectMongoose();
    console.log("Connected to MongoDB");

    // Fix image URLs first
    const usersWithBadImages = await User.find({
      image: { $regex: "i.ibb.co.com" },
    });
    console.log(
      `Found ${usersWithBadImages.length} users with incorrect image URLs`,
    );

    for (const user of usersWithBadImages) {
      if (user.image && user.image.includes("i.ibb.co.com")) {
        console.log(`Fixing image for user: ${user.name}`);
        user.image = user.image.replace("i.ibb.co.com", "i.ibb.co");

        // Also ensure uniqueNameCode exists since it is required
        if (!user.uniqueNameCode) {
          const cleanName = user.name
            .replace(/\s+/g, "")
            .toUpperCase()
            .slice(0, 6);
          const randomDigits = Math.floor(1000 + Math.random() * 9000);
          user.uniqueNameCode = `${cleanName}#${randomDigits}`;
          console.log(
            `Generated code for ${user.name}: ${user.uniqueNameCode}`,
          );
        }

        await user.save();
      }
    }

    // Now find users without uniqueNameCode regardless of image
    const usersWithoutCode = await User.find({
      uniqueNameCode: { $exists: false },
    });
    console.log(
      `Found ${usersWithoutCode.length} users without uniqueNameCode`,
    );

    for (const user of usersWithoutCode) {
      const cleanName = user.name.replace(/\s+/g, "").toUpperCase().slice(0, 6);
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      user.uniqueNameCode = `${cleanName}#${randomDigits}`;
      console.log(`Generated code for ${user.name}: ${user.uniqueNameCode}`);
      await user.save();
    }

    console.log("Migration complete");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

fixImageUrls();
