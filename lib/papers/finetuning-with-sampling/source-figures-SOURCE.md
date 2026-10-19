# Finetuning with Sampling: original paper visuals

These PNGs are unchanged crops of **Finetuning with Sampling: SFT Learns Better Than You Think**, arXiv:2610.02140v1, by Aayush Karan, Sitan Chen, and Yilun Du. The [arXiv entry](https://arxiv.org/abs/2610.02140) links its article rights to [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); checked 2026-10-20. Article captions credit the authors, exact visual, and license. The crops retain the original English labels, values, and plotted data.

- PDF: `https://arxiv.org/pdf/2610.02140v1`
- PDF SHA-256: `4cf6b1e1a402df339d7b56842618140f165290001ba4c92bd5a2d1065b9a6cc4`
- Extraction: PyMuPDF `page.get_pixmap(matrix=fitz.Matrix(4, 4), clip=fitz.Rect(...), alpha=False)`. Page numbers below are one-based; crop coordinates are PDF points `(x0, y0, x1, y1)`.

| File | PDF page | Crop | Content |
| --- | ---: | --- | --- |
| `source-figure-1.png` | 2 | `(106, 73, 507, 276)` | Figure 1, complete charts and legend |
| `source-figure-2.png` | 4 | `(155, 105, 458, 229)` | Figure 2, complete distribution schematic |
| `source-algorithm-1.png` | 7 | `(105, 71, 508, 452)` | Algorithm 1, complete pseudocode |
| `source-table-1.png` | 9 | `(108, 69, 505, 308)` | Table 1, all chemistry, math, and medical rows and columns |
| `source-figure-3.png` | 10 | `(108, 348, 506, 554)` | Figure 3, complete likelihood histograms |
| `source-figure-4.png` | 11 | `(168, 70, 439, 236)` | Figure 4, complete pass@k plot |
| `source-figure-5.png` | 11 | `(258, 446, 513, 610)` | Figure 5, complete KL and accuracy plot |
| `source-table-2.png` | 18 | `(108, 69, 505, 144)` | Table 2, all Olmo chemistry rows and columns |
| `source-appendix-a-chemistry.png` | 15 | `(107, 104, 507, 443)` | Appendix A, complete chemistry question and original/boosted answers |

The images were checked against all 19 rendered PDF pages. The Table 1 crop is dense at article width, so the article keeps its complete image with the site's enlargement control and explains the decisive values in surrounding text. The appendix example and secondary results are folded to keep the main reading path short.
