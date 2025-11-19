
import { Theme, AgentConfig } from './types';

export const FLOWER_THEMES: Record<string, Theme> = {
    "櫻花 Cherry Blossom": {
        name: "櫻花 Cherry Blossom",
        primary: "#FFB7C5",
        secondary: "#FFC0CB",
        accent: "#FF69B4",
        bg_light: "linear-gradient(135deg, #ffe6f0 0%, #fff5f8 50%, #ffe6f0 100%)",
        bg_dark: "linear-gradient(135deg, #2d1b2e 0%, #3d2533 50%, #2d1b2e 100%)",
        icon: "🌸"
    },
    "玫瑰 Rose": {
        name: "玫瑰 Rose",
        primary: "#E91E63",
        secondary: "#F06292",
        accent: "#C2185B",
        bg_light: "linear-gradient(135deg, #fce4ec 0%, #fff 50%, #fce4ec 100%)",
        bg_dark: "linear-gradient(135deg, #1a0e13 0%, #2d1420 50%, #1a0e13 100%)",
        icon: "🌹"
    },
    "薰衣草 Lavender": {
        name: "薰衣草 Lavender",
        primary: "#9C27B0",
        secondary: "#BA68C8",
        accent: "#7B1FA2",
        bg_light: "linear-gradient(135deg, #f3e5f5 0%, #fff 50%, #f3e5f5 100%)",
        bg_dark: "linear-gradient(135deg, #1a0d1f 0%, #2d1a33 50%, #1a0d1f 100%)",
        icon: "💜"
    },
    "鬱金香 Tulip": {
        name: "鬱金香 Tulip",
        primary: "#FF5722",
        secondary: "#FF8A65",
        accent: "#E64A19",
        bg_light: "linear-gradient(135deg, #fbe9e7 0%, #fff 50%, #fbe9e7 100%)",
        bg_dark: "linear-gradient(135deg, #1f0e0a 0%, #331814 50%, #1f0e0a 100%)",
        icon: "🌷"
    },
    "向日葵 Sunflower": {
        name: "向日葵 Sunflower",
        primary: "#FFC107",
        secondary: "#FFD54F",
        accent: "#FFA000",
        bg_light: "linear-gradient(135deg, #fff9e6 0%, #fffef5 50%, #fff9e6 100%)",
        bg_dark: "linear-gradient(135deg, #1f1a0a 0%, #332814 50%, #1f1a0a 100%)",
        icon: "🌻"
    },
    "蓮花 Lotus": {
        name: "蓮花 Lotus",
        primary: "#E91E8C",
        secondary: "#F48FB1",
        accent: "#AD1457",
        bg_light: "linear-gradient(135deg, #fce4f0 0%, #fff 50%, #fce4f0 100%)",
        bg_dark: "linear-gradient(135deg, #1f0e1a 0%, #331826 50%, #1f0e1a 100%)",
        icon: "🪷"
    }
};

export const MODEL_CHOICES = {
    "gpt-5-nano": "openai",
    "gpt-4o-mini": "openai",
    "gpt-4.1-mini": "openai",
    "gemini-2.5-flash": "gemini",
    "gemini-2.5-flash-lite": "gemini",
    "grok-4-fast-reasoning": "grok",
    "grok-3-mini": "grok",
    "claude-3-5-sonnet-20240620": "anthropic",
    "claude-3-opus-20240229": "anthropic",
    "claude-3-haiku-20240307": "anthropic",
};

export const DEFAULT_AGENTS: AgentConfig[] = [
    {
        name: "申請資料提取器",
        description: "進行繁體中文摘要",
        system_prompt: "你是一位醫療器材法規專家。根據提供的文件，進行繁體中文摘要in markdown in traditional chinese with keywords in coral color. Please also create a table include 20 key items。\n- 識別：廠商名稱、地址、品名、類別、證書編號、日期、機構\n- 標註不確定項目，保留原文引用\n- 以結構化格式輸出（表格或JSON）",
        user_prompt: "你是一位醫療器材法規專家。根據提供的文件，進行繁體中文摘要in markdown in traditional chinese with keywords in coral color. Please also create a table include 20 key items。",
        model: "claude-3-5-sonnet-20240620",
        temperature: 0,
        top_p: 0.9,
        max_tokens: 6000
    },
    {
        name: "合約資料分析師",
        description: "合約資料分析師",
        system_prompt: "合約資料分析師，請確認合約中包含以下內容，請摘要合約內容。\n- 委託者及受託者之名稱及地址： 委託者(甲方)名稱、地址，受託者(乙方)名稱、地址\n- 託製造之合意：委託者義務、受託者義務。",
        user_prompt: "請確認合約中包含以下內容，請摘要合約內容 in markdown in traditional chinese with keywords in coral color",
        model: "gpt-4o-mini",
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 1200
    },
    {
        name: "藥物交互作用分析器",
        description: "識別藥物-藥物、藥物-食物交互作用",
        system_prompt: "你是臨床藥學專家，專注於交互作用分析。\n- 識別：藥物-藥物、藥物-食物、藥物-疾病交互作用",
        user_prompt: "請分析以下文件的藥物交互作用：",
        model: "gpt-4o-mini",
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 1200
    },
    {
      name: "綜合報告生成器",
      description: "整合所有分析結果生成完整報告",
      system_prompt: "你是FDA文件整合專家。\n- 彙整：前述所有代理的分析結果\n- 生成：結構化完整報告",
      user_prompt: "請整合以下所有分析結果生成綜合報告：",
      model: "gpt-4o-mini",
      temperature: 0.4,
      top_p: 0.95,
      max_tokens: 2000
    }
];

export const TRANSLATIONS = {
    "zh_TW": {
        "title": "🌸 TFDA Agentic AI代理人輔助審查系統",
        "subtitle": "智慧文件分析與資料提取 AI 代理人平台",
        "theme_selector": "選擇花卉主題",
        "language": "語言",
        "dark_mode": "深色模式",
        "upload_tab": "1) 上傳與OCR",
        "preview_tab": "2) 預覽與編輯",
        "config_tab": "3) 代理設定",
        "execute_tab": "4) 執行",
        "dashboard_tab": "5) 儀表板",
        "notes_tab": "6) 審查筆記",
        "connected": "已連線",
        "not_connected": "未連線"
    },
    "en": {
        "title": "🌸 TFDA Agentic AI Assistance Review System",
        "subtitle": "Intelligent Document Analysis & Data Extraction AI Agent Platform",
        "theme_selector": "Select Floral Theme",
        "language": "Language",
        "dark_mode": "Dark Mode",
        "upload_tab": "1) Upload & OCR",
        "preview_tab": "2) Preview & Edit",
        "config_tab": "3) Agent Config",
        "execute_tab": "4) Execute",
        "dashboard_tab": "5) Dashboard",
        "notes_tab": "6) Review Notes",
        "connected": "Connected",
        "not_connected": "Not Connected"
    }
};

export const DEFAULT_REVIEW_NOTES = `# 審查筆記

在這裡記錄您的審查筆記。支援 Markdown 格式。

使用 HTML 標籤改變文字顏色，例如：<span style='color:red'>紅色文字</span>

## 後續問題
- 問題1？
- 問題2？`;
