# 部署：push 到 GitHub 就是发布

## 一句话模型

源码的唯一来源是 GitHub `guanyc/wordrhythm` 的 `main` 分支。Cloudflare 上那个名为
`wordrhythm` 的 Worker 直接连着这个仓库：推上去之后，**Cloudflare 自己拉代码、自己跑
`npm run build`、把 `out/` 当静态资产发出去**。没有 GitHub Actions，也不需要手动触发。

```
本地 git push origin main
        ↓
Cloudflare 拉取 main → npm run build → out/
        ↓
worker/index.ts + ./out 作为 ASSETS 上线   （约 1–2 分钟后生效）
```

**实测**（2026-11-17，推送 `654ae90` 之后直接回归线上，未做任何手动操作）：

| 检查点 | 线上结果 |
| --- | --- |
| `/blog/what-should-you-read-before-sleep` | 锚文本已是 `Google Play`，href 带 `referrer=…utm_content%3Dblog-body` |
| 同一页的旧形态 `>https://play.google.com` | 0 处 |
| `/versions/kjv` | `utm_content=version-page` |
| `/take-a-break` | `utm_content=take-a-break-page` |
| `/kjv/psalms/23/1` | `utm_content=kjv_web_verse` |
| `/app-ads.txt` | 200，`google.com, pub-9845844285520471, DIRECT, f08c47fec0942fa0` |

## 仓库里为什么看不到部署配置

这是个容易反复踩的坑：**没有 `.github/workflows` 不等于不会自动部署。**

- 构建命令、分支、构建缓存、环境变量：都在 **Cloudflare 面板**（Worker → Settings → Build）里，不在仓库。
- `wrangler.jsonc`：只描述运行时——`main: worker/index.ts`（只兜 `out/` 里没有文件的经文地址，
  例如超出本章节数的经节号要 302 回章节），`assets.directory: ./out`。
- `package.json` 的 `build` 脚本：Cloudflare 执行的就是这一条，本地和线上必须同一条。

## 构建链（顺序不能改）

```bash
npm run build
# = node scripts/check-data.mjs   ← 数据自检，失败就整次构建失败（故意放最前：数据坏了就别发）
#   && next build                 ← 静态导出进 out/
#   && node scripts/kjv-verses.mjs ← next build 之后才往 out/ 写 31,102 个经文页
#   && node scripts/rss.mjs
#   && node scripts/llms.mjs
```

`kjv-verses.mjs` 必须在 `next build` **之后**跑：它写的是 `out/` 里的文件，不是路由；
顺序反了就被 `next build` 覆盖掉。

本地预览用 `npm run preview`（http://localhost:3001），它照资产绑定的顺序解析路径
（精确文件 → `.html` → `index.html` → 导出时的 404 页），所以除"越界经节号该 302 而这里是 404"，
页面内容和线上逐字节一致。`npm run dev` 答不了 `/kjv/<book>/<chapter>/<verse>`，别用它验经文页。

## 什么进 git，什么不进

| 路径 | 处理 | 原因 |
| --- | --- | --- |
| `/out/`、`/.next/`、`/.wrangler/` | 不入库 | Cloudflare 从源码构建，产物永远别 `git add` |
| `public/**` | 入库 | 原样落到站点根：`public/app-ads.txt` → `wordrhythm.app/app-ads.txt`（AdMob 爬的就是它） |
| `.env.production` | **故意入库** | `NEXT_PUBLIC_GA_ID` 是公开值，烘进仓库就省掉面板配置；真实环境变量仍优先 |
| `next-env.d.ts` | 不入库 | Next.js 自动生成 |

## 推完自检（等 1–2 分钟再跑）

```bash
# 首页 / 版本页 / 博客 / 经文页四条路径都要 200
for u in / /versions/kjv /blog/what-should-you-read-before-sleep /kjv/psalms/23/1; do
  printf "%-46s %s\n" "$u" "$(curl -s -o /dev/null -w '%{http_code}' https://wordrhythm.app$u)"
done

# 归因是否还在（新版本每个 Play 链接都应带编码后的 referrer）
curl -s https://wordrhythm.app/versions/kjv | grep -o 'utm_content%3D[a-z0-9_-]*' | sort -u

# app-ads.txt 仍可访问
curl -s -o /dev/null -w '%{http_code}\n' https://wordrhythm.app/app-ads.txt
```

页面没有版本号，确认"线上到底是哪个提交"只能靠内容指纹：挑一个这次才引入的字符串
（例如上面那批 `utm_content`），改前改后各 `curl` 一次比对即可。

## 回滚

```bash
git revert <bad-commit> && git push    # 走同一条自动部署链，最干净
```

`npm run deploy`（`wrangler deploy`）也能发，但它上传的是**你本机 `out/`**，可能和 `main`
不一致；只用于"面板构建挂了、必须马上恢复"的应急，发完记得把源码补回仓库。

## 常见失败

| 现象 | 判断 |
| --- | --- |
| 构建直接失败 | 看是不是卡在 `check-data.mjs`；本地 `npm run check-data` 能复现 |
| 页面 200 但内容还是旧的 | 先确认推的是 `main` 且面板构建成功；再 `curl -H 'Cache-Control: no-cache'` 排除缓存 |
| 只有经文页 404，其它正常 | `kjv-verses.mjs` 没跑成，`out/` 里缺那张页 |
| 越界经节号返回 404 | 本地预览的正常表现；线上由 `worker/index.ts` 302 回章节 |
