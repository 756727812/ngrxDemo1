# 应用部署

## 测试环境配置

此项目采用 [Gitlab CI](https://docs.gitlab.com/ce/ci/) 做自动部署，配置文件查看 [.gitlab-ci.yml](../.gitlab-ci.yml)。

Web 管理地址为 https://gitlab.seeapp.com/FE/xiaodianpu-saas/pipelines。

开发者只需关注 YAML 中 `only` 项下的分支名称，其值为指定部署环境的分支。

## 生产环境部署

登录生产机器后，执行 `sh /data/backend/rsync_fe.sh` 发布脚本，选择预发布环境，即已经构建好的静态文件位于的环境，确认执行，发布成功。
