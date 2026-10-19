# V-Rubrics: original paper visuals

These PNGs are unchanged crops of **V-Rubrics: Visual Faithfulness via Rubric-Based Reinforcement Learning**, arXiv:2608.25580v1, by Shulin Tian and coauthors. The [arXiv entry](https://arxiv.org/abs/2608.25580) links the article rights to [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); checked 2026-10-20. The article captions credit each original Figure/Table and the license. Figure 1 contains a question image from AI2D inside the authors' composite figure; AI2D is credited in the adjacent article caption.

- PDF: `https://arxiv.org/pdf/2608.25580v1`
- PDF SHA-256: `afc97b220ba5fe562b0778d7ebbf89274f50246b2f9df82a75735ebe6f3ac559`
- Extraction: PyMuPDF `page.get_pixmap(matrix=fitz.Matrix(4, 4), clip=fitz.Rect(...), alpha=False)`. Page numbers below are one-based; crop coordinates are PDF points `(x0, y0, x1, y1)`.

| File | PDF page | Crop | Content |
| --- | ---: | --- | --- |
| `source-figure-1.png` | 1 | `(305,218,529,518)` | Figure 1, AI2D tide question and all six rubric items |
| `source-figure-2.png` | 2 | `(69,70,526,281)` | Figure 2, complete construction and training flow |
| `source-figure-3.png` | 5 | `(70,70,291,219)` | Figure 3, data-source and rubric-type distribution |
| `source-table-1.png` | 7 | `(70,118,524,347)` | Table 1, all general and knowledge rows and columns |
| `source-table-2.png` | 8 | `(70,118,524,365)` | Table 2, all visual reasoning rows and columns |
| `source-table-3.png` | 8 | `(75,380,283,434)` | Table 3, all three ablation rows |
| `source-figure-4.png` | 9 | `(70,70,291,434)` | Figure 4, both qualitative cases |
| `source-table-4.png` | 17 | `(205,70,390,281)` | Table 4, all 17 data sources and total |
| `source-table-5.png` | 18 | `(71,74,381,480)` | Table 5, full rubric-generation prompt |
| `source-table-6.png` | 19 | `(70,72,527,391)` | Table 6, full experimental configuration |

The original English labels, table values, and figure contents are preserved. Dense Tables 1, 2, and 6 have in-panel horizontal scrolling on narrow screens and use the site's image enlargement control. Secondary Figure 3/4 and Tables 4–6 are available in labeled disclosures to keep the main reading path shorter.
