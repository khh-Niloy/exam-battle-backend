import { connectMongoose } from "../app/lib/connectMongoose";
import { User } from "../app/modules/users/user.model";
import { Roles, StudentGroup } from "../app/modules/users/user.interface";
import { envVars } from "../app/config/env";
import bcrypt from "bcryptjs";

const insertUsers = async () => {
  try {
    await connectMongoose();

    const password = await bcrypt.hash(
      "password123",
      Number(envVars.BCRYPT_SALT_ROUND),
    );

    const users = [
      {
        name: "Ariful Islam",
        email: "ariful@example.com",
        password: password,
        role: Roles.FREE,
        phone: "+8801711223344",
        studentInfo: {
          instituteName: "Dhaka College",
          group: StudentGroup.SCIENCE,
          class: "12",
        },
      },
      {
        name: "Neha",
        email: "neha@example.com",
        password: password,
        role: Roles.FREE,
        phone: "+8801811223344",
        studentInfo: {
          instituteName: "Monipur High School",
          group: StudentGroup.SCIENCE,
          class: "11",
        },
      },
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`User ${userData.email} already exists.`);
        continue;
      }
      await User.create(userData);
      console.log(`User ${userData.email} inserted successfully.`);
    }

    console.log("Insertion finished.");
    process.exit(0);
  } catch (error) {
    console.error("Error inserting users:", error);
    process.exit(1);
  }
};

insertUsers();
