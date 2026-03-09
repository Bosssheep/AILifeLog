
import { generateReply } from "./server/aiService.js";
import dotenv from "dotenv";
dotenv.config();

const testBlocks = [
  { tag: "thoughts", content: "今天心情一般，但是写了代码觉得很充实。" }
];
const testDate = "2026-03-07";

async function testNodeIntegration() {
  console.log("--- 开始测试 Node.js -> Python 集成 ---");
  try {
    const result = await generateReply(testBlocks, testDate);
    if (result) {
      console.log("✅ 测试成功！");
      console.log("回信内容预览:", result.content.substring(0, 50) + "...");
      console.log("元数据:", JSON.stringify(result.metadata, null, 2));
    } else {
      console.log("❌ 测试失败：未返回结果。");
    }
  } catch (error) {
    console.error("❌ 测试过程中发生异常:", error);
  }
  console.log("--- 测试结束 ---");
}

testNodeIntegration();
