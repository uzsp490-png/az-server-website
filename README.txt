AZ SERVER v3 商業級外觀版

檔案：
- index.html
- style.css
- script.js
- README.txt

上傳方式：
1. 解壓縮 ZIP
2. 到 GitHub 的 az-server-website 倉庫
3. Add file → Upload files
4. 上傳覆蓋 index.html、style.css、script.js、README.txt
5. Commit changes
6. Vercel 會自動更新

這版新增：
- AZ 金屬動畫 Logo
- 真正 DayZ 風 HUD 首頁
- 黑市頁面
- VIP 商城頁
- 玩家資料面板外觀
- Steam Workshop 模組中心
- 玩家排行榜
- 戰術地圖展示
- 公告中心
- 手機版選單強化
- 滑鼠紅光效果
- SEO 描述強化

需要修改的地方：
1. index.html 搜尋「請填入」
2. 填入伺服器 IP
3. 填入 Discord 連結
4. 填入 Steam Workshop 連結
5. 修改 VIP 方案價格
6. 修改公告內容
7. 修改排行榜資料
8. 修改地圖標記名稱

注意：
目前在線玩家、Discord、排行榜、玩家面板都是展示資料。
要變成真資料，需要後續串 API / BattleMetrics / Discord Widget / 資料庫。
