import os
import sys
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
from datetime import datetime

# 1. 配置 API Key
# 尝试从当前目录和父目录加载 .env
load_dotenv() 
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

api_key = os.getenv("GOOGLE_API_KEY")

# 配置代理 (如果环境变量中有则使用)
if os.getenv("HTTP_PROXY"):
    os.environ["http_proxy"] = os.getenv("HTTP_PROXY")
if os.getenv("HTTPS_PROXY"):
    os.environ["https_proxy"] = os.getenv("HTTPS_PROXY")

# 2. 初始化 Gemini 模型
# 提供多个模型选项，优先从环境变量读取，默认为 gemini-1.5-flash-latest
# 推荐选项: gemini-1.5-flash-latest (速度快), gemini-1.5-pro-latest (深度分析)
model_name = os.getenv("GOOGLE_AI_MODEL", "gemini-1.5-flash-latest")

llm = ChatGoogleGenerativeAI(
    model=model_name, 
    google_api_key=api_key,
    temperature=0.7,
)

# 3. 读取Prompt 文件
def load_prompt(file_path):
    # 尝试相对路径加载
    abs_path = os.path.join(os.path.dirname(__file__), file_path)
    with open(abs_path, "r", encoding="utf-8") as f:
        return f.read()

try:
    SYSTEM_PROMPT_CONTENT = load_prompt("prompt_v1.j2")
except Exception as e:
    # 如果读取失败，至少保证程序不崩溃并输出错误
    print(f"ERROR: 无法加载 Prompt 文件: {e}", file=sys.stderr)
    sys.exit(1)

prompt_template = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT_CONTENT),
    ("user", "{{ user_input }}"),
], template_format="jinja2")

# 4. 构建链
chain = prompt_template | llm | StrOutputParser()

# 5. 获取输入
def main():
    if not api_key:
        print("ERROR: 未能加载 API Key，请检查环境变量 GOOGLE_API_KEY", file=sys.stderr)
        sys.exit(1)

    # 如果有命令行参数，优先使用；否则从 stdin 读取
    if len(sys.argv) > 1:
        user_input = sys.argv[1]
        current_date = sys.argv[2] if len(sys.argv) > 2 else datetime.now().strftime("%Y-%m-%d")
    else:
        # 从 stdin 读取 JSON 字符串
        try:
            input_data = json.loads(sys.stdin.read())
            user_input = input_data.get("user_input", "")
            current_date = input_data.get("current_date", datetime.now().strftime("%Y-%m-%d"))
        except:
            print("ERROR: 无法解析输入数据", file=sys.stderr)
            sys.exit(1)

    if not user_input:
        sys.exit(0)

    try:
        response = chain.invoke({"user_input": user_input, "current_date": current_date})
        # 直接输出响应内容，不带装饰，方便 Node.js 解析
        print(response)
    except Exception as e:
        print(f"ERROR: AI 生成失败: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
