AZ RPG Website V5.0 官方客服中心版

新增：
1. 全站右下角固定「聯絡客服」浮動按鈕
2. LINE / Discord / 網站客服工單三個明顯入口
3. 新增 support.html 客服中心
4. 工單欄位：遊戲名稱、Steam 17位ID、分類、聯絡方式、標題、內容
5. 自動產生 AZ-YYYYMMDD-XXXX 工單編號
6. 目前 submitMode = demo：工單只存在玩家自己的瀏覽器，用於測試介面
7. 之後接 Supabase / Firebase / 自架 API 時，修改 js/support-config.js：
   submitMode: "api"
   apiEndpoint: "你的 API 網址"

官方網址集中修改：
js/support-config.js
  lineUrl
  discordUrl
  officialWebsite

注意：目前網站工單「尚未真正送到客服」，要有真正客服收件與回覆，需要下一步串後端資料庫。
