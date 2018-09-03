# 工作流

## Git Flow

开发时请务必使用 Git Flow 协作流程。

介绍：https://jeffkreeftmeijer.com/git-flow/

安装：https://github.com/nvie/gitflow/wiki/Installation

或是使用 [Sourcetree](https://www.sourcetreeapp.com/) 进行交互式管理。

## Git Commit Message

为统一团队协作规范，提交信息请务必使用 [Commitizen](https://github.com/commitizen/cz-cli)，预设已在 `package.json` 中配置 `cz-emoji`。

## Lint

每次修改的文件在 `precommit` hook 执行时都会调用 `lint-staged` 工具对文件进行 lint 检查与修复。
