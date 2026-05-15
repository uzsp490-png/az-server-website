AZ SERVER v2 官網部署說明

這是第二版大型 DayZ 伺服器官網靜態版，可直接丟到 GitHub + Vercel。

檔案：
- index.html
- style.css
- script.js
- README.txt

更新方式：
1. 解壓縮 ZIP
2. 到 GitHub 的 az-server-website 倉庫
3. 上傳覆蓋 index.html、style.css、script.js、README.txt
4. Commit changes
5. Vercel 會自動重新部署

你需要改的地方：
- index.html：請填入 IP:2302
- index.html：填入 Discord 連結
- index.html：填入 Steam Workshop 連結
- VIP 價格與內容
- 公告內容
- 排行榜展示資料
- 地圖標記名稱

目前「在線玩家、Discord 在線、排行榜」都是展示資料。
之後如果要真實同步，需要另外串接 API / 資料庫 / BattleMetrics / Discord Widget。
