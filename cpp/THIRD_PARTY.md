# 第三方模板与资源

本版前端使用 Tabler 开源模板，针对课程讲义重新制作页面结构与内容。不是 Tabler 官方产品，也未引入其示例后台、收费插件或远程 CDN。

| 资源 | 本地版本 / 使用范围 | 来源与许可 |
|---|---|---|
| Tabler Core | 1.7.0；官方编译 CSS，卡片、按钮、表格、表单、徽章、进度组件 | https://github.com/tabler/tabler ，MIT |
| Bootstrap 样式基础 | 由 Tabler Core CSS 包含，未独立加载 Bootstrap JS | https://github.com/twbs/bootstrap ，MIT |
| Tabler Icons | 本地 SVG 子集；图标也内联到 app.js | https://github.com/tabler/tabler-icons ，MIT |
| Study Sans SC | Noto Sans SC 课程字符子集；变量字重 100–900；内部字体名重命名，保留上游版权与 OFL | https://github.com/google/fonts/tree/main/ofl/notosanssc ，SIL Open Font License 1.1 |
| JetBrains Mono Variable | @fontsource-variable/jetbrains-mono 5.3.0；Latin wght normal；代码字体 | https://github.com/JetBrains/JetBrainsMono ，SIL Open Font License 1.1 |
| Inter Variable | @fontsource-variable/inter 5.3.0；Latin wght normal | https://github.com/rsms/inter ，SIL Open Font License 1.1 |

完整许可与版权声明保存在 assets/vendor/tabler/LICENSE、assets/vendor/bootstrap/LICENSE、assets/vendor/tabler-icons/LICENSE 、assets/vendor/inter/LICENSE、assets/vendor/study-sans-sc/LICENSE 和 assets/vendor/jetbrains-mono/LICENSE。版本与资源信息见 assets/vendor/dependencies.json。许可必须随重新分发的学习包保留。

中文使用从 Noto Sans SC 生成的课程子集 Study Sans SC，超出子集的字符使用系统字体回退。原始字体只读；修改包括字符裁剪、内部字体族重命名和 WOFF2 转换，字体仍按 OFL 1.1 分发。字体、CSS 与图标全部在本项目内；离线使用不依赖第三方网络。
