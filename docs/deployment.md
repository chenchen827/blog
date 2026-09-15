# 生产部署手册

## 环境映射

- GitHub 仓库：`git@github.com:chenchen827/blog.git`
- GitHub 默认分支：`master`
- 服务器：`8.137.97.238`，Ubuntu 24.04 + 宝塔面板 + Nginx
- 博客：<https://www.chenchen.fun/>
- 管理后台：<https://admin.chenchen.fun/>
- API：<https://api.chenchen.fun/>
- 发布根目录：`/www/wwwroot/blog-frontend-sites`
- 当前发布入口：`/www/wwwroot/blog-frontend-sites/{blog,admin}`
- 不可变发布目录：`/www/wwwroot/blog-frontend-sites/releases/<git-sha>/{blog,admin}`

前台使用站点根路径构建，不使用 `/blog/` 或 `/admin/` 子路径。GitHub Actions 只在 GitHub 上运行，Gitee push 不会触发 CI/CD。

## 首次服务器配置

### 1. 创建专用发布用户

在受信任的开发机上生成专用密钥，不要复用个人或 root 私钥。提示输入 passphrase 时连续回车留空，GitHub Actions 才能非交互登录：

```powershell
ssh-keygen -t ed25519 -C "github-actions-chenchen-blog" -f $HOME\.ssh\chenchen-blog-deploy
```

将公钥传给服务器，然后通过现有 `ssh cc` 创建发布用户和目录：

```powershell
Get-Content $HOME\.ssh\chenchen-blog-deploy.pub | ssh cc "cat > /tmp/chenchen-blog-deploy.pub"
```

```bash
id deployer >/dev/null 2>&1 || useradd --create-home --shell /bin/bash deployer
install -d -m 700 -o deployer -g deployer /home/deployer/.ssh
cp /tmp/chenchen-blog-deploy.pub /home/deployer/.ssh/authorized_keys
chown deployer:deployer /home/deployer/.ssh/authorized_keys
chmod 600 /home/deployer/.ssh/authorized_keys
install -d -m 755 -o deployer -g deployer \
  /www/wwwroot/blog-frontend-sites \
  /www/wwwroot/blog-frontend-sites/releases \
  /www/wwwroot/blog-frontend-sites/incoming
```

`deployer` 不加入 sudo 组。公钥写入服务器，私钥只保存到 GitHub `production` Environment Secret。

### 2. 宝塔站点

在宝塔面板创建两个 HTML 站点，并设置站点根目录：

- `www.chenchen.fun` → `/www/wwwroot/blog-frontend-sites/blog`
- `admin.chenchen.fun` → `/www/wwwroot/blog-frontend-sites/admin`

两个站点都配置 SPA 回退：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

首次发布前目录可能不存在，发布脚本会创建 `blog` 和 `admin` 两个符号链接。宝塔不得将这两个入口改成非空真实目录。

### 3. HTTPS

在宝塔为以下域名申请 Let's Encrypt 证书，并开启强制 HTTPS：

- `www.chenchen.fun`
- `admin.chenchen.fun`
- `api.chenchen.fun`

`api.chenchen.fun` 只增加证书和 443 配置，继续反向代理到 `127.0.0.1:3000`。证书正式启用后执行：

```bash
nginx -t
nginx -s reload
```

宝塔面板需要保留自动续签任务。到期前人工检查：

```bash
echo | openssl s_client -servername www.chenchen.fun -connect www.chenchen.fun:443 2>/dev/null | openssl x509 -noout -subject -dates
```

## GitHub 配置

在 GitHub 仓库设置中创建 `production` Environment，并配置：

Variables：

| 名称 | 值 |
| --- | --- |
| `DEPLOY_HOST` | `8.137.97.238` |
| `DEPLOY_PORT` | `22` |
| `DEPLOY_USER` | `deployer` |
| `DEPLOY_PATH` | `/www/wwwroot/blog-frontend-sites` |

Secrets：

| 名称 | 值 |
| --- | --- |
| `DEPLOY_SSH_KEY` | 专用私钥完整内容 |
| `DEPLOY_KNOWN_HOSTS` | `ssh-keyscan -p 22 8.137.97.238` 校验指纹后的输出 |

## CI

`.github/workflows/ci.yml` 在以下场景运行：

- 面向 `master` 的 Pull Request
- `master` push
- Actions 页面手动触发

CI 会执行锁文件安装、全仓类型检查、两个生产构建，并验证 HTML 使用 `/assets/...` 根路径。

## 手动发布

只有 `master` 可以执行生产操作。在 GitHub Actions 中选择 `Deploy production`，设置：

- `mode=deploy`
- `release_sha` 留空

工作流会重新构建当前 `master`，生成 `frontend-<sha>.tgz`，上传到服务器 `incoming` 目录，然后：

1. 校验归档中只有 `blog/` 和 `admin/`。
2. 解压到 `releases/<sha>`。
3. 原子切换 `blog`、`admin` 符号链接。
4. 检查首页、深层路由和 HTML 引用的静态资源。
5. 任一检查失败时自动恢复上一组符号链接。
6. 成功后保留最近 5 个 release。

## 回滚

先确认目标 release 仍存在：

```bash
ssh cc "find /www/wwwroot/blog-frontend-sites/releases -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort"
```

在 GitHub Actions 中手动运行 `Deploy production`：

- `mode=rollback`
- `release_sha=<releases 目录中完整的 Git SHA>`

回滚同样执行健康检查；失败时恢复回滚前的 symlink。

## 发布后验收

```bash
curl -fsS -o /dev/null -w 'blog=%{http_code}\n' https://www.chenchen.fun/
curl -fsS -o /dev/null -w 'admin=%{http_code}\n' https://admin.chenchen.fun/
curl -fsS -o /dev/null -w 'api=%{http_code}\n' https://api.chenchen.fun/
curl -fsS -o /dev/null -w 'blog_route=%{http_code}\n' https://www.chenchen.fun/search
curl -fsS -o /dev/null -w 'admin_route=%{http_code}\n' https://admin.chenchen.fun/articles/list
```

同时检查浏览器控制台无 CORS、混合内容或静态资源加载错误，并验证登录与 token 请求。
