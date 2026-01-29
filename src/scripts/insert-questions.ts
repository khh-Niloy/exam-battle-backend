import { connectMongoose } from "../app/lib/connectMongoose";
import { Question } from "../app/modules/question/question.model";
import { QuestionPaper } from "../app/modules/questionPaper/questionPaper.model";

const questions = [
  {
    question:
      "এক ব্যক্তি 7m ব্যাসার্ধের একটি অর্ধবৃত্তাকার মাঠের পরিধি বরাবর ব্যাসের অপর প্রান্তে গেল। ব্যক্তির সরণ হল -",
    options: ["14m", "16m", "22m", "25m"],
    correctIndex: 0,
  },
  {
    question:
      "একটি বস্তুকণার প্রাথমিক বেগ 10m/s ও মন্দন 2m/s2। কণাটি কতক্ষণ পরে থামবে?",
    options: ["2s", "4s", "5s", "6s"],
    correctIndex: 2,
  },
  {
    question:
      "500g ভরের কোনো বস্তুর ওপর কত বল প্রযুক্ত হলে 2m/s2 ত্বরণ উৎপন্ন হবে?",
    options: ["1N", "1.5N", "2N", "4N"],
    correctIndex: 0,
  },
  {
    question:
      "মোটরচালিত একটি বেল্ট 5m/s সমবেগে গতিশীল। যদি ওপর থেকে 1kg/s হারে বালি বেল্টের ওপর ফেলা হয়, তাহলে সমগতি বজায় রাখার জন্য মোটর কত বল প্রয়োগ করবে?",
    options: ["2.5N", "5N", "7.5N", "10N"],
    correctIndex: 1,
  },
  {
    question: "কোনো বলের দুটি সমকৌণিক উপাংশ 3N ও 4N হলে বলের মান হল",
    options: ["7N", "6N", "8N", "5N"],
    correctIndex: 3,
  },
  {
    question:
      "একটি রকেট প্রতি সেকেন্ডে 10kg জ্বালানি দহন করে এবং উৎপন্ন গ্যাস 1000m/s বেগে রকেট থেকে নির্গত হয়। রকেটের ওপর ঊর্ধ্বঘাত হল -",
    options: ["10000N", "5000N", "50000N", "100000N"],
    correctIndex: 0,
  },
  {
    question:
      "4kg ভরবিশিষ্ট একটি বন্দুক থেকে 500m/s বেগে 6g ভরের গুলি ছুড়লে বন্দুকটির প্রতিক্ষেপ বেগ হবে -",
    options: ["50cm/s", "25cm/s", "20cm/s", "75cm/s"],
    correctIndex: 3,
  },
  {
    question:
      "নীচের চিত্রে একটি কণার বেগ-সময় লেখচিত্র দেখানো হয়েছে। কণার গড় গতিবেগ হল - (বেগ-সময় লেখচিত্র সাপেক্ষে)",
    options: ["4m/s", "6m/s", "3m/s", "2m/s"],
    correctIndex: 3,
  },
  {
    question: "রকেটের গতি যে সংরক্ষণ নীতির ওপর প্রতিষ্ঠিত তা হল-",
    options: ["রৈখিক ভরবেগ", "বল", "ভর", "গতিশক্তি"],
    correctIndex: 0,
  },
  {
    question: "কত বল প্রয়োগ করলে 10g ভরের কোনো বস্তুর ত্বরণ 6cm/s2 হবে?",
    options: ["50 dyn", "60 dyn", "70 dyn", "80 dyn"],
    correctIndex: 1,
  },
];

const seedQuestions = async () => {
  try {
    await connectMongoose();
    console.log("Connected to database...");

    // 1. Create QuestionPaper
    const questionPaper = await QuestionPaper.create({
      examName: "Physics Battle - Motion and Force",
      questionIds: [], // Will update later
    });

    console.log(`Created QuestionPaper: ${questionPaper.examName}`);

    // 2. Insert Questions
    const questionData = questions.map((q) => ({
      ...q,
      questionPaperId: questionPaper._id,
    }));

    const createdQuestions = await Question.insertMany(questionData);
    console.log(`Inserted ${createdQuestions.length} questions.`);

    // 3. Update QuestionPaper with question IDs
    const questionIds = createdQuestions.map((q) => q._id);
    await QuestionPaper.findByIdAndUpdate(questionPaper._id, {
      $set: { questionIds },
    });

    console.log("QuestionPaper updated with question IDs.");
    console.log("Seeding completed successfully!");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding questions:", error);
    process.exit(1);
  }
};

seedQuestions();
