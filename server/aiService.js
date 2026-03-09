import { spawn } from "child_process";
import path from "path";
import crypto from "crypto";

/**
 * 调用 Python 脚本生成回信
 * @param {Array} blocks 日记内容块列表
 * @param {string} date 当前日期
 * @returns {Promise<Object>} 包含回信内容和元数据的对象
 */
export const generateReply = async (blocks, date) => {
  return new Promise((resolve) => {
    try {
      // 将 blocks 转换为 AI 更易理解的字符串格式
      const diaryContent = blocks
        .filter((b) => b.tag !== "reply") // 排除旧的回信
        .map((b) => `[${b.tag}] ${b.content}`)
        .join("\n\n");

      if (!diaryContent.trim()) return resolve(null);

      const scriptPath = path.resolve(process.cwd(), "agent", "agent.py");
      const inputData = JSON.stringify({
        user_input: diaryContent,
        current_date: date,
      });

      console.log(`[AI-Python] 正在为日期 ${date} 的日记调用 Python 脚本...`);
      console.log(`[AI-Python] 脚本路径: ${scriptPath}`);

      const pythonProcess = spawn("python3", [scriptPath], {
        env: { ...process.env, PYTHONIOENCODING: "utf-8" },
      });

      let output = "";
      let errorOutput = "";

      pythonProcess.stdin.write(inputData);
      pythonProcess.stdin.end();

      pythonProcess.stdout.on("data", (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          console.error(`[AI-Python] Python 脚本退出，错误码: ${code}`);
          console.error(`[AI-Python] 错误输出: ${errorOutput}`);
          return resolve(null);
        }

        // 解析返回的内容 (按照 Prompt 中的 Output Format)
        const response = output.trim();
        console.log(
          `[AI-Python] 收到 Python 原始输出 (前 200 字符): ${response.substring(0, 200)}...`,
        );

        // 1. 提取元数据 (Metadata)
        let metadata = {};
        const part2Match = response.match(/\[Part 2:[^\]]*\]([\s\S]*)/i);
        const jsonMatch = response.match(/```json([\s\S]*?)```/i);

        if (part2Match) {
          try {
            const jsonStr = part2Match[1].trim().replace(/```json|```/gi, "");
            metadata = JSON.parse(jsonStr);
          } catch (e) {
            console.error("[AI-Python] 从 Part 2 解析 JSON 失败:", e);
          }
        } else if (jsonMatch) {
          try {
            metadata = JSON.parse(jsonMatch[1].trim());
          } catch (e) {
            console.error("[AI-Python] 从代码块解析 JSON 失败:", e);
          }
        }

        // 2. 提取并清洗正文内容 (Content)
        let finalContent = response;

        // --- 暴力清洗逻辑升级 ---
        // 1. 如果有 [Part 2] 标记，砍掉标记及其之后的所有内容
        const part2Index = finalContent.search(/\[Part 2/i);
        if (part2Index !== -1) {
          finalContent = finalContent.substring(0, part2Index);
        }

        // 2. 移除所有 Markdown 代码块 (针对各种格式的 json 或普通块)
        finalContent = finalContent.replace(/```[\s\S]*?```/g, "");

        // 3. 移除任何看起来像 JSON 的结构 (以 { 开头并以 } 结尾的内容)
        // 我们从后往前找，因为元数据通常在末尾
        const lastBrace = finalContent.lastIndexOf("}");
        if (lastBrace !== -1) {
          // 寻找匹配的第一个左括号（针对可能的嵌套，我们寻找最外层的 {）
          const firstBrace = finalContent.lastIndexOf("{", lastBrace);
          if (firstBrace !== -1) {
            const chunk = finalContent.substring(firstBrace, lastBrace + 1);
            // 如果这个块包含明显的元数据键名，直接切除
            if (
              chunk.includes('"sentiment"') ||
              chunk.includes('"score"') ||
              chunk.includes('"timestamp"')
            ) {
              finalContent =
                finalContent.substring(0, firstBrace) +
                finalContent.substring(lastBrace + 1);
            }
          }
        }

        // 4. 移除所有 Jinja2/模板 标签
        finalContent = finalContent.replace(/{%[\s\S]*?%}/g, "");
        finalContent = finalContent.replace(/{{[\s\S]*?}}/g, "");

        // 5. 移除所有 Part 标记
        finalContent = finalContent.replace(/\[Part \d+:[^\]]*\]/gi, "");

        // 6. 清理多余的装饰线和空白
        finalContent = finalContent
          .replace(/\n\s*(\*\*\*|---|___)\s*\n/g, "\n\n")
          .replace(/(\*\*\*|---|___)\s*$/g, "")
          .trim();

        // 3. 格式化元数据并追加到内容末尾
        const infoLines = [];
        if (metadata.sentiment && metadata.sentiment.score) {
          infoLines.push(`🌟 综合评分：${metadata.sentiment.score}`);
        } else if (metadata.score) {
          infoLines.push(`🌟 综合评分：${metadata.score}`);
        }

        if (metadata.sentiment && metadata.sentiment.label) {
          infoLines.push(`🏷️ 情绪标签：${metadata.sentiment.label}`);
        } else if (metadata.label) {
          infoLines.push(`🏷️ 情绪标签：${metadata.label}`);
        }

        if (
          metadata.personality_insight &&
          metadata.personality_insight.growth_point
        ) {
          infoLines.push(
            `💡 成长建议：${metadata.personality_insight.growth_point}`,
          );
        } else if (metadata.growth_point) {
          infoLines.push(`💡 成长建议：${metadata.growth_point}`);
        }

        if (infoLines.length > 0) {
          finalContent += "\n\n---\n" + infoLines.join("\n");
        }

        console.log(`[AI-Python] 回信生成成功`);
        console.log(
          `[AI-Python] 最终内容预览: ${finalContent.substring(0, 100)}...`,
        );
        resolve({
          content: finalContent,
          metadata: metadata,
        });
      });
    } catch (error) {
      console.error("❌ [AI-Python] 调用失败:", error);
      resolve(null);
    }
  });
};
