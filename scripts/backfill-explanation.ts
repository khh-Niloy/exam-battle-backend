import mongoose from "mongoose";
import dotenv from "dotenv";
import { Question } from "../src/app/modules/question/question.model";

import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

const backfillExplanation = async () => {
    try {
        const dbUri = process.env.MONGO_URI;
        if (!dbUri) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }

        await mongoose.connect(dbUri);
        console.log("Connected to database");

        const result = await Question.updateMany(
            { explanation: { $exists: false } },
            { $set: { explanation: "This is a demo explanation for the question." } }
        );

        console.log(`Updated ${result.modifiedCount} questions with demo explanation.`);

        await mongoose.disconnect();
        console.log("Disconnected from database");
    } catch (error) {
        console.error("Error backfilling explanations:", error);
        process.exit(1);
    }
};

backfillExplanation();
