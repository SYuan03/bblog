# Harness-R1 论文原图与表格来源

- 论文：Shuai Shao 等，*Harness-R1: Learning to Edit Executable Runtime Harnesses from Agent Failure Trajectories*，arXiv:2608.02276v1，<https://arxiv.org/abs/2608.02276v1>。
- 许可：该版本 arXiv 页面“view license”指向 [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)。正文每张图均注明作者、编号与许可。
- 图像只做空白边或整表裁切，不改文字、坐标和数据。Figure 4 的两个原始矢量子图分别呈现，以便手机放大阅读。

| 本地文件 | 原始位置 | 处理 |
| --- | --- | --- |
| `source-figure-1.svg` | <https://arxiv.org/html/2608.02276v1/FIG_motivation_editing.svg>，Figure 1 | 原始矢量图 |
| `source-figure-2.png` | <https://arxiv.org/html/2608.02276v1/x1.png>，Figure 2 | 原图 1600×900，裁切 `(115, 90, 1130, 575)` 去除空白，输出 1015×485 |
| `source-figure-4a.svg` | <https://arxiv.org/html/2608.02276v1/FIG_random10_heldout_generalization.svg>，Figure 4(a) | 原始矢量图 |
| `source-figure-4b.svg` | <https://arxiv.org/html/2608.02276v1/FIG_lifecycle_ablation.svg>，Figure 4(b) | 原始矢量图 |
| `source-table-1.png` | <https://arxiv.org/pdf/2608.02276v1> 第 7 页，Table 1 | 原 PDF 按 288 DPI 渲染，裁切页面坐标 `(68, 60, 545, 288)` pt，输出 1908×912；保留全部比较行与列 |
| `source-table-h1.png` | 同一 PDF 第 21 页，Table H.1 | 原 PDF 按 288 DPI 渲染，裁切页面坐标 `(68, 58, 545, 165)` pt，输出 1908×428；保留完整表头与三行 |

Figure 1 的纵轴是环境奖励变化。Figure 2 图底的二元成功奖励只是流程示意；论文 §3.2 和 Appendix B.4 明确 WebShop 的训练奖励为连续环境分。Table 1 的 Avg. 是三个环境成功率的等权平均；Figure 4(a) 的未见任务结果则合并 1,270 道题计算。正文分别说明这些分母。
