# 旅遊行程看板渲染器 (Notion Based) PRD

## 1. 專案概述 (Overview)
本專案旨在建立一個以 **Notion Database** 作為後端的旅遊行程渲染器。只需在部署後在環境變數配置 Notion API Key 和 Database ID，即可動態更新前端顯示的旅遊內容。專案優先適配 **移動端** 介面。

- **核心價值**: 資料與介面分離。透過 Notion 管理行程，前端負責 Premium 的視覺呈現。
- **安全性**: 透過 Next.js API Routes 建立 Server-side Proxy，確保 `NOTION_API_KEY` 不會暴露於前端。

## 2. 核心功能需求 (Functional Requirements)

### 2.1 Notion 資料綁定與對應
- **動態切換**: 透過環境變數設定 `NOTION_API_KEY` 與 `NOTION_DATABASE_ID`。
- **資料分層 (基於 `type` 欄位)**:
    - **配置型資料 (`type: config`)**: 讀取 `config` 欄位。定義 `country` (目的地國家/標題)、`city` (城市)、`gmt` (時差)、`exchange` (目標幣別)、`password` (網站存取密碼)。
    - **行程型資料 (`type: journey`)**: 讀取 `journey` 欄位。分類包括：`transport` (交通), `visit` (景點), `hotel` (住宿), `restaurant` (餐廳), `shopping` (購物)。

### 2.2 介面功能 (UI Features)
- **Top Bar (固定 玻璃擬態)**:
    - **標題與日期**: 顯示城市名稱、旅遊日期範圍。
    - **視覺優化**: 採用漸層背景與 iOS 風格排版。
- **分日行程列表 (Group by Day)**:
    - **自動分組**: 根據日期自動計算「Day 1, Day 2...」並進行區分。
    - **日期標題**: 每個分組上方顯示日期與星期 (e.g., "10/16 (Wed)")。
- **底部導航選單 (6 Tabs 固定)**:
    - **行程**: 依照時間軸分日排列的活動。
    - **首頁 / 景點 / 住宿 / 交通 / 資訊**: 各自過濾對應分類顯示（開發中）。
        - **首頁**:
            - 判斷當天日期，如果非活動當天日期，以每一天為一個卡片做收折顯示，使用者可以點擊卡片展開該日的行程。
            - 如果是活動當天日期，則顯示該日的行程，用時間軸的方式展示，同時需要偵測當時的時間點，過去時間的行程降低顯示飽和度。
            - 首頁有下拉選單用於選擇日期，預設是活動當天日期，使用者選擇其他日期則顯示指定日期的行程。
        - **景點**:
            - 包含景點、餐廳、購物，按照分類展示。
            - 以時間作為排序，時間越近的行程越前面。，過去時間的行程降低顯示飽和度。
        - **住宿**:
            - 需要顯示住宿地點的照片。
        - **交通**:
        - **資訊**:
- **卡片展示**: type 為 journey 的資料所有展示形式預設相同。
- **匯率換算器**:
    - 置頂於行程頁，方便根據 `exchange` 設定即時參考，需要連動即時匯率。
- **地圖與導航**:
    - 點擊 `maps` 連結自動喚起導航（優先支援 Google/Apple Maps）。

### 2.3 渲染器細節
- **時間軸卡片**: 針對不同 `journey` 分類提供專屬 Premium 圖示。
- **Cover Image**: 讀取 Notion 頁面的 **Cover Image**。若有封面則以大圖顯示，無封面則自動縮小卡片高度。
- **本地時間固定與時區校正**: 
    - 忽略 Notion API 回傳的時區偏移量。
    - 強制將 Notion 輸入的日期時間字串 (ISO 8601) 解析為**目的地當地時間 (Destination Local Time)**。
    - 確保在任何時區瀏覽網頁時，行程時間均顯示為當地時間 (例如輸入 10:00 即顯示 10:00)，避免因瀏覽器時區不同而產生日期或時間誤差。

### 2.4 行程隱私保護 (Privacy & Auth)
- **密碼登入機制**:
    - 在 Database `config` 增加 `password` 設定網站存取密碼 (6位數)。
    - 雖是靜態網站渲染，但在進入主頁面 (**Root Layout**) 前需通過 **Server Action** 驗證。
    - **驗證流程**:
        1. 使用者開啟網站，若無有效 Cookie，顯示全螢幕密碼輸入框 (**PasswordProtection**)，此時網頁原始碼不包含任何行程資料。
        2. 輸入密碼後，透過 Server Action 比對 Notion Config 中的密碼。
        3. 驗證成功寫入 `httpOnly` Cookie (`journey_auth`)，有效期 7 天。
        4. 驗證通過後，Layout 才會渲染 `children` (行程內容)，確保資料隱私。
    - **登出/過期**: Cookie 到期或清除後，需重新輸入密碼。

## 3. Notion Database 欄位架構 (Schema)
1.  **title**: 標題 (Title)
2.  **type**: 資料大類 (Select: `config`, `journey`)
3.  **config**: 配置細項 (Select: `country`, `city`, `exchange`, `gmt`, `password`) - *僅當 type 為 config 時有效*
4.  **journey**: 行程分類 (Select: `transport`, `hotel`, `visit`, `restaurant`, `shopping`) - *僅當 type 為 journey 時有效*
5.  **date**: 時間 (Date with time)
6.  **maps**: 地點連結 (URL)
7.  **Cover**: 使用 Notion 內建封面圖 (Page Cover)

## 4. 技術規格 (Technical Specifications)
- **框架**: Next.js (App Router)。
- **樣式**: shadcn/ui + Vanilla CSS (Premium 玻璃擬態、動態效果) + TailwindCSS。
- **安全性**: 使用 `/api/notion` 代理所有 Notion 請求。
- **部署**: 支援 Zeabur / Vercel 一鍵部署。

## 5. 部署與極簡配置 (Deployment)
- **零程式碼修改**: 使用者只需設定環境變數即可完成配置。
- **自動化渲染**: 系統自動解析 `type` 與對應屬性，產出分組後的行程看板。