# Self-Harness 论文原图与表格来源

- 论文：Hangfan Zhang 等，*Self-Harness: Harnesses That Improve Themselves*，arXiv:2606.09498v3，<https://arxiv.org/abs/2606.09498v3>。
- 许可：该版本 arXiv 页面“view license”指向 [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)。正文各图注明作者、编号和许可。
- 下列局部只按像素裁切；Figure 14 的上下说明行保存在完整原图中，正文用文字解释。未改变任何案例文字或测试数字。

| 文件 | 原始位置 | 处理 |
| --- | --- | --- |
| `source-figure-1.png` | <https://arxiv.org/html/2606.09498v3/figures/sh1.png>，Figure 1 | 原图，2155×730 |
| `source-figure-2.svg` | <https://arxiv.org/html/2606.09498v3/sh-6-8-4.svg>，Figure 2 | 原始矢量图，1575×1124 pt |
| `source-figure-14.png` | <https://arxiv.org/html/2606.09498v3/case_qwen_swe_django.png>，Figure 14 | 原图，1520×348 |
| `source-figure-14-initial.png` | Figure 14 左半 | 裁切 `(0, 0, 760, 306)`，旧 harness 的失败记录 |
| `source-figure-14-final.png` | Figure 14 右半 | 裁切 `(760, 0, 1520, 306)`，新 harness 的成功记录 |
| `source-table-1.png` | <https://arxiv.org/pdf/2606.09498v3> 第 11 页，Table 1 | 原 PDF 页面按 288 DPI 渲染，裁切像素范围 `(288, 330, 2100, 1190)`，1812×860；完整保留三组 benchmark 的表格和数值 |

Figure 14 右半的 49 个本地测试，与官方评分的 1 个 FAIL-TO-PASS 加 46 个 PASS-TO-PASS 测试属于不同集合；正文没有把它们相加或视为同一分母。
