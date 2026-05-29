#!/usr/bin/env python3
"""Genera docs/informe-tecnico.pdf desde docs/informe-tecnico.md (SCRUM-24)."""
from __future__ import annotations

import re
import sys
from pathlib import Path

from fpdf import FPDF

ROOT = Path(__file__).resolve().parents[1]
MD_PATH = ROOT / "docs" / "informe-tecnico.md"
PDF_PATH = ROOT / "docs" / "informe-tecnico.pdf"


class InformePDF(FPDF):
    def footer(self):
        self.set_y(-12)
        self.set_font("Helvetica", "I", 8)
        self.cell(0, 8, f"Página {self.page_no()}/{{nb}}", align="C")


def strip_md_inline(text: str) -> str:
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)
    text = re.sub(r"`([^`]+)`", r"\1", text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    text = re.sub(r"<[^>]+>", "", text)
    replacements = {
        "\u2192": "->",
        "\u2265": ">=",
        "\u2264": "<=",
        "\u2248": "~",
        "\u2014": "-",
        "\u2013": "-",
        "\u00b7": "-",
    }
    for src, dst in replacements.items():
        text = text.replace(src, dst)
    text = text.encode("latin-1", "replace").decode("latin-1")
    return text.strip() or " "


def safe_multi_cell(pdf: FPDF, h: float, text: str, font: tuple[str, str, int] = ("Helvetica", "", 10)) -> None:
    text = re.sub(r"[^\x00-\xFF]", "?", text)
    if not text:
        return
    pdf.set_x(pdf.l_margin)
    pdf.set_font(*font)
    pdf.multi_cell(0, h, text)


def build_pdf(md_text: str) -> FPDF:
    pdf = InformePDF(orientation="P", unit="mm", format="A4")
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.set_margins(20, 20, 20)
    pdf.add_page()

    in_code = False
    code_lines: list[str] = []
    skip_until_h2 = False

    for raw_line in md_text.splitlines():
        line = raw_line.rstrip()

        if line.startswith("---") and not in_code:
            continue
        if line.startswith("title:") or line.startswith("author:") or line.startswith("date:"):
            continue
        if line.startswith("<div") or line.startswith("</div"):
            continue
        if line.startswith("```"):
            if in_code:
                pdf.set_font("Courier", "", 8)
                for cl in code_lines:
                    safe_multi_cell(pdf, 4, strip_md_inline(cl), ("Courier", "", 8))
                code_lines = []
                in_code = False
                pdf.set_font("Helvetica", "", 10)
            else:
                in_code = True
            continue
        if in_code:
            code_lines.append(line)
            continue

        if line.startswith("# ") and not line.startswith("## "):
            if pdf.get_y() > 250:
                pdf.add_page()
            pdf.set_font("Helvetica", "B", 18)
            safe_multi_cell(pdf, 10, strip_md_inline(line[2:].strip()), ("Helvetica", "B", 18))
            pdf.ln(4)
            continue

        if line.startswith("## "):
            if pdf.page_no() > 1 and pdf.get_y() > 40:
                pdf.add_page()
            pdf.ln(3)
            safe_multi_cell(pdf, 8, strip_md_inline(line[3:].strip()), ("Helvetica", "B", 14))
            pdf.ln(2)
            continue

        if line.startswith("### "):
            pdf.set_font("Helvetica", "B", 11)
            safe_multi_cell(pdf, 7, strip_md_inline(line[4:].strip()), ("Helvetica", "B", 11))
            pdf.ln(1)
            continue

        if line.startswith("|") and "|" in line[1:]:
            if re.match(r"^\|[-:\s|]+\|$", line):
                continue
            cells = [c.strip() for c in line.strip("|").split("|")]
            row = " | ".join(strip_md_inline(c) for c in cells)
            pdf.set_font("Courier", "", 8)
            safe_multi_cell(pdf, 4, row, ("Courier", "", 8))
            pdf.set_font("Helvetica", "", 10)
            continue

        if line.startswith("- ") or line.startswith("* "):
            pdf.set_font("Helvetica", "", 10)
            safe_multi_cell(pdf, 5, f"  - {strip_md_inline(line[2:].strip())}")
            continue

        if re.match(r"^\d+\.\s", line):
            pdf.set_font("Helvetica", "", 10)
            safe_multi_cell(pdf, 5, f"  {strip_md_inline(line.strip())}")
            continue

        if line.strip() == "":
            pdf.ln(2)
            continue

        if any(ch in line for ch in "┌┐└┘│─▼▲◄►"):
            pdf.set_font("Courier", "", 7)
            short = strip_md_inline(line[:95])
            safe_multi_cell(pdf, 3.5, short, ("Courier", "", 7))
            pdf.set_font("Helvetica", "", 10)
            continue

        if len(line) > 100 and " " not in line[:50]:
            continue

        if line.startswith(">"):
            pdf.set_font("Helvetica", "I", 10)
            safe_multi_cell(pdf, 5, strip_md_inline(line.lstrip("> ").strip()), ("Helvetica", "I", 10))
            pdf.set_font("Helvetica", "", 10)
            continue

        pdf.set_font("Helvetica", "", 10)
        safe_multi_cell(pdf, 5, strip_md_inline(line.strip()))

    return pdf


def main() -> int:
    if not MD_PATH.exists():
        print(f"ERROR: no existe {MD_PATH}", file=sys.stderr)
        return 1

    md_text = MD_PATH.read_text(encoding="utf-8")
    pdf = build_pdf(md_text)
    pdf.output(str(PDF_PATH))
    pages = pdf.page_no()
    size_kb = PDF_PATH.stat().st_size / 1024
    print(f"OK: {PDF_PATH} ({pages} páginas, {size_kb:.1f} KB)")
    return 0 if pages >= 15 else 2


if __name__ == "__main__":
    sys.exit(main())
