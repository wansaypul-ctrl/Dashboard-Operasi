#!/usr/bin/env python3
"""Merge cover.pdf + body.pdf → final PRD PDF at /home/z/my-project/download/."""

import os
from pypdf import PdfReader, PdfWriter

COVER = '/home/z/my-project/.prd_pdf_build/cover.pdf'
BODY  = '/home/z/my-project/.prd_pdf_build/body.pdf'
OUT   = '/home/z/my-project/download/PRD_Sistem_Dashboard_Pemantauan_Bersepadu_JTM.pdf'

A4_W, A4_H = 595.28, 841.89  # A4 in points

def normalize_page_to_a4(page):
    """Always scale to exact A4 dimensions, even for sub-pt mismatches.
    This guarantees consistent page size across cover + body merge."""
    box = page.mediabox
    w, h = float(box.width), float(box.height)
    if abs(w - A4_W) > 0.1 or abs(h - A4_H) > 0.1:
        page.scale_to(A4_W, A4_H)
    return page

def main():
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    writer = PdfWriter()

    # Cover (page 1)
    cover_reader = PdfReader(COVER)
    cover_page = cover_reader.pages[0]
    writer.add_page(normalize_page_to_a4(cover_page))

    # Body (pages 2+)
    body_reader = PdfReader(BODY)
    for p in body_reader.pages:
        writer.add_page(normalize_page_to_a4(p))

    # Metadata
    writer.add_metadata({
        '/Title':    'PRD — Sistem Dashboard Pemantauan Bersepadu JTM',
        '/Author':   'Jabatan Tenaga Manusia (JTM)',
        '/Creator':  'Z.ai',
        '/Producer': 'Z.ai',
        '/Subject':  'Product Requirements Document — Integrated Monitoring Dashboard System (JTM)',
        '/Keywords': 'PRD, JTM, Dashboard, Glassmorphism, Supabase, Netlify, GLM 5.2, ILP, IKM',
    })

    with open(OUT, 'wb') as f:
        writer.write(f)

    size_kb = os.path.getsize(OUT) / 1024
    print(f'✅ Final PDF: {OUT}')
    print(f'   Pages: {len(writer.pages)}')
    print(f'   Size:  {size_kb:.1f} KB')

if __name__ == '__main__':
    main()
