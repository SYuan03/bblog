# HarnessDev 原图与原表来源

- 论文：Yuhao Wu 等，*HarnessDev: Can LLMs Create and Evolve Their Own Agent Harness?*，arXiv:2609.01437v1，2026-09-01。
- 论文 PDF：<https://arxiv.org/pdf/2609.01437>，本地 SHA-256 `1231454f0ae5ccffdb3d031dc8f42eae0cbbaeb61dcd25dddb1855074697dfc0`。
- arXiv 权利页：<https://arxiv.org/abs/2609.01437> 的 Rights 链接指向 <https://creativecommons.org/licenses/by-nc-nd/4.0/>。本站将完整图表用于非商业性论文解读，图表内容、英文标注和数值未改动；每处正文图片旁均署作者、图表编号、来源与许可。若本站将来用于商业用途，应重新取得授权或移除这些图表。

| 文章资源 | 原论文位置 | 取得方式 |
| --- | --- | --- |
| `source-figure-1.svg` | Figure 1 | 从 <https://arxiv.org/html/2609.01437v1/teaser.svg> 原样保存，未修改 SVG 字节。 |
| `source-figure-2.png` | PDF 第 5 页 Figure 2 | 按 PDF 坐标 `(70, 106, 542, 280)` 以 4× 渲染；只去掉页边与图注。 |
| `source-figure-3.png` | PDF 第 5 页 Figure 3 | 按 PDF 坐标 `(70, 572, 542, 714)` 以 4× 渲染；只去掉页边与图注。 |
| `source-table-3.png` | PDF 第 8 页 Table 3 | 按 PDF 坐标 `(70, 184, 542, 305)` 以 4× 渲染；保留全部行列与星号。 |
| `source-figure-6.png` | PDF 第 11 页 Figure 6 | 按 PDF 坐标 `(70, 104, 542, 426)` 以 4× 渲染；保留全部五个子图及图例。 |
| `source-table-6.png` | PDF 第 12 页 Table 6 | 按 PDF 坐标 `(145, 172, 468, 371)` 以 4× 渲染；仅去掉表格外大块页边，保留全部九行。 |

坐标单位为 PDF point，顺序是 `(x0, y0, x1, y1)`。PNG 使用 PyMuPDF 的 `page.get_pixmap(matrix=fitz.Matrix(4, 4), clip=fitz.Rect(...), alpha=False)` 直接从原 PDF 渲染。提取后的文件哈希记录在来源清单与发布验收中。
