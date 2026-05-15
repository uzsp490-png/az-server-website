AZ SERVER 官網部署說明

這包是靜態網站版本，可以直接部署到 Vercel / Cloudflare Pages / Netlify。

Vercel 使用方式：
1. 解壓縮 az-server-website.zip
2. 把裡面的 index.html 和 style.css 上傳到 GitHub 倉庫
3. 回到 Vercel，選擇 Import Git Repository
4. 選剛剛的 GitHub 倉庫
5. Framework Preset 選 Other
6. Build Command 留空
7. Output Directory 留空或填 .
8. Deploy

要修改的地方：
- index.html 裡面的「請填入你的伺服器 IP:Port」
- index.html 裡面的 Discord 連結
- 網頁標題、介紹文字、規則內容
