"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const question_model_1 = require("../src/app/modules/question/question.model");
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, "../.env") });
const backfillExplanation = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const dbUri = process.env.MONGO_URI;
        if (!dbUri) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }
        yield mongoose_1.default.connect(dbUri);
        console.log("Connected to database");
        const result = yield question_model_1.Question.updateMany({ explanation: { $exists: false } }, { $set: { explanation: "This is a demo explanation for the question." } });
        console.log(`Updated ${result.modifiedCount} questions with demo explanation.`);
        yield mongoose_1.default.disconnect();
        console.log("Disconnected from database");
    }
    catch (error) {
        console.error("Error backfilling explanations:", error);
        process.exit(1);
    }
});
backfillExplanation();
