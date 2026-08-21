
(() => {
  const DICT = {"zh-TW": {"首頁": "首頁", "最新公告": "最新公告", "任務系統": "任務系統", "玩家成長": "玩家成長", "遊戲世界": "遊戲世界", "苦根地圖": "苦根地圖", "百科": "百科", "啟動器下載": "啟動器下載", "客服中心": "客服中心", "玩家中心": "玩家中心", "伺服器狀態": "伺服器狀態", "登入": "登入", "註冊": "註冊", "登出": "登出", "查看全部": "查看全部", "詳細資訊": "詳細資訊", "查看最新公告": "查看最新公告", "伺服器資訊": "伺服器資訊", "新手指南": "新手指南", "開啟苦根地圖": "開啟苦根地圖", "查看苦根介紹": "查看苦根介紹", "官方宣傳影片": "官方宣傳影片", "開啟影片聲音": "開啟影片聲音", "關閉影片聲音": "關閉影片聲音", "通知中心": "通知中心", "我的工單": "我的工單", "個人資料": "個人資料", "帳號安全": "帳號安全", "全部標記已讀": "全部標記已讀", "清除已讀": "清除已讀", "更換頭像": "更換頭像", "移除": "移除", "送出回覆": "送出回覆", "回覆客服": "回覆客服", "建立工單": "建立工單", "今日不再顯示此公告": "今日不再顯示此公告"}, "zh-CN": {"首頁": "首页", "最新公告": "最新公告", "任務系統": "任务系统", "玩家成長": "玩家成长", "遊戲世界": "游戏世界", "苦根地圖": "苦根地图", "百科": "百科", "啟動器下載": "启动器下载", "客服中心": "客服中心", "玩家中心": "玩家中心", "伺服器狀態": "服务器状态", "登入": "登录", "註冊": "注册", "登出": "退出登录", "查看全部": "查看全部", "詳細資訊": "详细信息", "查看最新公告": "查看最新公告", "伺服器資訊": "服务器信息", "新手指南": "新手指南", "開啟苦根地圖": "打开苦根地图", "查看苦根介紹": "查看苦根介绍", "官方宣傳影片": "官方宣传视频", "開啟影片聲音": "开启视频声音", "關閉影片聲音": "关闭视频声音", "通知中心": "通知中心", "我的工單": "我的工单", "個人資料": "个人资料", "帳號安全": "账号安全", "全部標記已讀": "全部标记已读", "清除已讀": "清除已读", "更換頭像": "更换头像", "移除": "移除", "送出回覆": "发送回复", "回覆客服": "回复客服", "建立工單": "创建工单", "今日不再顯示此公告": "今日不再显示此公告"}, "en": {"首頁": "Home", "最新公告": "News", "任務系統": "Quests", "玩家成長": "Progression", "遊戲世界": "World", "苦根地圖": "Bitterroot Map", "百科": "Wiki", "啟動器下載": "Launcher", "客服中心": "Support", "玩家中心": "Player Center", "伺服器狀態": "Server Status", "登入": "Sign In", "註冊": "Register", "登出": "Sign Out", "查看全部": "View All", "詳細資訊": "Details", "查看最新公告": "Latest News", "伺服器資訊": "Server Info", "新手指南": "Beginner Guide", "開啟苦根地圖": "Open Bitterroot Map", "查看苦根介紹": "Bitterroot Guide", "官方宣傳影片": "Official Trailer", "開啟影片聲音": "Enable Video Sound", "關閉影片聲音": "Mute Video", "通知中心": "Notifications", "我的工單": "My Tickets", "個人資料": "Profile", "帳號安全": "Account Security", "全部標記已讀": "Mark All Read", "清除已讀": "Clear Read", "更換頭像": "Change Avatar", "移除": "Remove", "送出回覆": "Send Reply", "回覆客服": "Reply to Support", "建立工單": "Create Ticket", "今日不再顯示此公告": "Do not show again today"}};
  const KEY = "az_site_language";

  function norm(v) { return (v || "").trim(); }

  function currentLang() {
    return localStorage.getItem(KEY) || "zh-TW";
  }

  function translateTextNodes(lang) {
    const dict = DICT[lang] || DICT["zh-TW"];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    for (const node of nodes) {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT","STYLE","TEXTAREA"].includes(parent.tagName)) continue;
      const raw = node.nodeValue;
      const t = norm(raw);
      if (!t || !(t in dict)) continue;

      const lead = raw.match(/^\s*/)?.[0] || "";
      const tail = raw.match(/\s*$/)?.[0] || "";
      node.nodeValue = lead + dict[t] + tail;
    }

    document.querySelectorAll("[placeholder]").forEach(el => {
      const t = norm(el.getAttribute("placeholder"));
      if (t && dict[t]) el.setAttribute("placeholder", dict[t]);
    });
    document.querySelectorAll("[title]").forEach(el => {
      const t = norm(el.getAttribute("title"));
      if (t && dict[t]) el.setAttribute("title", dict[t]);
    });
  }

  function setMenuLabel(lang) {
    const label = document.getElementById("azLangLabel");
    if (!label) return;
    label.textContent = lang === "en" ? "English" : lang === "zh-CN" ? "简体中文" : "繁體中文";
    document.documentElement.lang = lang;
  }

  function apply(lang) {
    localStorage.setItem(KEY, lang);
    setMenuLabel(lang);
    translateTextNodes(lang);

    document.querySelectorAll("#azLangMenu [data-lang]").forEach(b => {
      b.classList.toggle("active", b.dataset.lang === lang);
    });
  }

  function setup() {
    const btn = document.getElementById("azLangBtn");
    const menu = document.getElementById("azLangMenu");

    if (btn && menu) {
      btn.addEventListener("click", e => {
        e.stopPropagation();
        menu.classList.toggle("show");
      });
      menu.querySelectorAll("[data-lang]").forEach(b => {
        b.addEventListener("click", () => {
          apply(b.dataset.lang);
          menu.classList.remove("show");
          // Reload to ensure dynamic text created by other scripts is translated cleanly.
          location.reload();
        });
      });
      document.addEventListener("click", () => menu.classList.remove("show"));
    }

    apply(currentLang());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }
})();
