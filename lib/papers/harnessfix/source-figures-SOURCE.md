# HarnessFix 论文原图与表格来源

- 论文：Mengzhuo Chen et al., *From Failed Trajectories to Reliable LLM Agents: Diagnosing and Repairing Harness Flaws*, arXiv:2606.06324v2, <https://arxiv.org/abs/2606.06324v2>。
- 许可：arXiv v2 页面“view license”指向 [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)。正文图片旁均注明作者、图表编号和许可。
- 以下局部图片从对应原图裁切，没有修改案例文字或数值。Figure 3 的 S3–S5 局部另将左上角相邻 S2 框的一小段残边遮白，范围见下表；完整版也保存在本目录，并可从正文展开或点击查看。

| 文件 | 原始位置 | 处理 |
| --- | --- | --- |
| `source-figure-1.png` | <https://arxiv.org/html/2606.06324v2/figure/distribution.png>，Figure 1 | 原图，1096×523 |
| `source-figure-2.png` | <https://arxiv.org/html/2606.06324v2/figure/overview.png>，Figure 2 | 原图，2988×1052 |
| `source-figure-2-stages-1-2.png` | Figure 2 | 裁切原图像素范围 `(420, 0, 1850, 1052)`；Stage 1–2 |
| `source-figure-2-stages-3-4.png` | Figure 2 | 裁切 `(1850, 0, 2988, 1052)`；Stage 3–4 |
| `source-figure-3.png` | <https://arxiv.org/html/2606.06324v2/figure/htir_running_example_appworld_v5.png>，Figure 3 | 原图，3008×528 |
| `source-figure-3-steps-3-5.png` | Figure 3 | 裁切 `(675, 0, 2105, 528)`；再遮白局部左上角 `(0, 0, 42, 220)` 的相邻 S2 残边；S3–S5 |
| `source-figure-3-steps-6-result.png` | Figure 3 | 裁切 `(2105, 0, 3008, 528)`；S6 与 evaluator |
| `source-table-vi.png` | [PDF v2](https://arxiv.org/pdf/2606.06324v2) 第 9 页，Table VI | 从原 PDF 页面坐标 `(310, 122, 563, 216)` pt 以 4× 渲染裁切，1012×376；保留整张消融表 |

Figure 3 原图显示 `amount=117.6`，同一版本 §III-A 的结构化请求摘录显示 `amount=54.0`。两处数字不同，正文明确指出差异，没有将两者合并为一条可重建的原始运行记录。
