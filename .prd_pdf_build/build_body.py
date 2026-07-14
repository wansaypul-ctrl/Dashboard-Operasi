#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Build the body PDF for: PRD — Sistem Dashboard Pemantauan Bersepadu JTM.

Output: /home/z/my-project/.prd_pdf_build/body.pdf  (body only — TOC + 12 sections + appendices)
The cover is rendered separately via Playwright (cover.html → cover.pdf) and merged later.

Palette (JTM brand, user-specified):
    NAVY  #0B2545   primary
    ROYAL #1B4B91   secondary
    TEAL  #0E8388   accent
    AMBER #C79A3B   warning
    RED   #D64545   critical
"""

import os
import sys
import hashlib

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, mm
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether,
    Table, TableStyle, CondPageBreak, Preformatted, Flowable,
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ── PDF skill scripts on path for install_font_fallback ────────────────
PDF_SKILL_DIR = '/home/z/my-project/skills/pdf'
_scripts = os.path.join(PDF_SKILL_DIR, 'scripts')
if _scripts not in sys.path:
    sys.path.insert(0, _scripts)

# ── Output ─────────────────────────────────────────────────────────────
OUTPUT_BODY = '/home/z/my-project/.prd_pdf_build/body.pdf'

# ── Font registration ──────────────────────────────────────────────────
FONT_DIR = '/usr/share/fonts'

pdfmetrics.registerFont(TTFont('FreeSerif',           f'{FONT_DIR}/truetype/freefont/FreeSerif.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-Bold',      f'{FONT_DIR}/truetype/freefont/FreeSerifBold.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-Italic',    f'{FONT_DIR}/truetype/freefont/FreeSerifItalic.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-BoldItalic',f'{FONT_DIR}/truetype/freefont/FreeSerifBoldItalic.ttf'))
pdfmetrics.registerFont(TTFont('FreeSans',            f'{FONT_DIR}/truetype/freefont/FreeSans.ttf'))
pdfmetrics.registerFont(TTFont('FreeSans-Bold',       f'{FONT_DIR}/truetype/freefont/FreeSansBold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSansMono',      f'{FONT_DIR}/truetype/dejavu/DejaVuSansMono.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSansMono-Bold', f'{FONT_DIR}/truetype/dejavu/DejaVuSansMono-Bold.ttf'))

registerFontFamily('FreeSerif',
    normal='FreeSerif', bold='FreeSerif-Bold',
    italic='FreeSerif-Italic', boldItalic='FreeSerif-BoldItalic')
registerFontFamily('FreeSans', normal='FreeSans', bold='FreeSans-Bold')
registerFontFamily('DejaVuSansMono', normal='DejaVuSansMono', bold='DejaVuSansMono-Bold')

# Install fallback (handles any stray non-Latin chars gracefully)
try:
    from pdf import install_font_fallback
    install_font_fallback()
except Exception:
    pass  # fallback optional — content is pure Latin/Malay

# ── Palette (JTM brand — user-specified exact hex) ─────────────────────
NAVY        = colors.HexColor('#0B2545')   # primary
ROYAL       = colors.HexColor('#1B4B91')   # secondary
TEAL        = colors.HexColor('#0E8388')   # accent
AMBER       = colors.HexColor('#C79A3B')   # warning
RED         = colors.HexColor('#D64545')   # critical
NAVY_SOFT   = colors.HexColor('#13325e')
GLASS_FILL  = colors.HexColor('#eef2f7')   # very light navy tint for table stripes
CODE_BG     = colors.HexColor('#f4f6f9')   # code block background
CODE_BORDER = colors.HexColor('#c8d2df')
TEXT_PRIM   = colors.HexColor('#1a2230')
TEXT_MUTED  = colors.HexColor('#5a6b80')
RULE_SOFT   = colors.HexColor('#c8d2df')

# Table palette aliases
TABLE_HEADER_COLOR = NAVY
TABLE_HEADER_TEXT  = colors.white
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = GLASS_FILL

# ── Page geometry ──────────────────────────────────────────────────────
PAGE_W, PAGE_H = A4
LEFT_M  = 0.75 * inch
RIGHT_M = 0.75 * inch
TOP_M   = 0.85 * inch
BOT_M   = 0.85 * inch
AVAIL_W = PAGE_W - LEFT_M - RIGHT_M

# ── Styles ─────────────────────────────────────────────────────────────
BODY_FONT   = 'FreeSerif'
BODY_BOLD   = 'FreeSerif-Bold'
BODY_ITAL   = 'FreeSerif-Italic'
SANS_FONT   = 'FreeSans'
SANS_BOLD   = 'FreeSans-Bold'
MONO_FONT   = 'DejaVuSansMono'

style_h1 = ParagraphStyle('H1',
    fontName=SANS_BOLD, fontSize=18, leading=24,
    textColor=NAVY, spaceBefore=14, spaceAfter=10,
    alignment=TA_LEFT)

style_h2 = ParagraphStyle('H2',
    fontName=SANS_BOLD, fontSize=13.5, leading=18,
    textColor=NAVY, spaceBefore=12, spaceAfter=6,
    alignment=TA_LEFT)

style_h3 = ParagraphStyle('H3',
    fontName=SANS_BOLD, fontSize=11.5, leading=16,
    textColor=ROYAL, spaceBefore=10, spaceAfter=4,
    alignment=TA_LEFT)

style_h4 = ParagraphStyle('H4',
    fontName=SANS_BOLD, fontSize=10.5, leading=14,
    textColor=TEAL, spaceBefore=8, spaceAfter=3,
    alignment=TA_LEFT)

style_body = ParagraphStyle('Body',
    fontName=BODY_FONT, fontSize=10.5, leading=16,
    textColor=TEXT_PRIM, alignment=TA_JUSTIFY,
    spaceBefore=0, spaceAfter=6)

style_body_left = ParagraphStyle('BodyLeft',
    parent=style_body, alignment=TA_LEFT)

style_bullet = ParagraphStyle('Bullet',
    fontName=BODY_FONT, fontSize=10.5, leading=15,
    textColor=TEXT_PRIM, alignment=TA_LEFT,
    leftIndent=18, bulletIndent=4,
    spaceBefore=2, spaceAfter=2)

style_meta = ParagraphStyle('Meta',
    fontName=BODY_ITAL, fontSize=9, leading=12,
    textColor=TEXT_MUTED, alignment=TA_CENTER,
    spaceBefore=2, spaceAfter=2)

style_caption = ParagraphStyle('Caption',
    fontName=BODY_ITAL, fontSize=9, leading=12,
    textColor=TEXT_MUTED, alignment=TA_CENTER,
    spaceBefore=3, spaceAfter=6)

style_table_header = ParagraphStyle('THeader',
    fontName=SANS_BOLD, fontSize=9.5, leading=12,
    textColor=colors.white, alignment=TA_LEFT)

style_table_header_c = ParagraphStyle('THeaderC',
    parent=style_table_header, alignment=TA_CENTER)

style_table_cell = ParagraphStyle('TCell',
    fontName=BODY_FONT, fontSize=9, leading=12,
    textColor=TEXT_PRIM, alignment=TA_LEFT)

style_table_cell_mono = ParagraphStyle('TCellMono',
    fontName=MONO_FONT, fontSize=8.5, leading=11,
    textColor=NAVY, alignment=TA_LEFT)

style_table_cell_c = ParagraphStyle('TCellC',
    parent=style_table_cell, alignment=TA_CENTER)

style_callout = ParagraphStyle('Callout',
    fontName=BODY_ITAL, fontSize=10, leading=14,
    textColor=NAVY, alignment=TA_LEFT,
    leftIndent=14, rightIndent=14,
    spaceBefore=4, spaceAfter=4)

style_kpi = ParagraphStyle('KPI',
    fontName=BODY_FONT, fontSize=9.5, leading=13,
    textColor=NAVY, alignment=TA_LEFT,
    leftIndent=14, rightIndent=14,
    spaceBefore=2, spaceAfter=6,
    backColor=GLASS_FILL, borderColor=TEAL, borderWidth=0,
    borderPadding=6, leftBorderColor=TEAL)

style_mono = ParagraphStyle('Mono',
    fontName=MONO_FONT, fontSize=8.2, leading=10.5,
    textColor=NAVY, alignment=TA_LEFT,
    spaceBefore=0, spaceAfter=0,
    leftIndent=0, rightIndent=0)

# Code block style — supports background, border, and SPLITTING across pages
# (Preformatted respects backColor/borderColor/borderPadding in ParagraphStyle).
style_code = ParagraphStyle('Code',
    fontName=MONO_FONT, fontSize=7.4, leading=9.8,
    textColor=NAVY, alignment=TA_LEFT,
    spaceBefore=0, spaceAfter=0,
    leftIndent=10, rightIndent=8,
    backColor=CODE_BG,
    borderColor=CODE_BORDER, borderWidth=0.6, borderPadding=(6, 8, 6, 10),
    splitLongParagraphs=True)

# TOC styles
style_toc1 = ParagraphStyle('TOC1',
    fontName=SANS_BOLD, fontSize=11, leading=18,
    textColor=NAVY, leftIndent=0, rightIndent=20)
style_toc2 = ParagraphStyle('TOC2',
    fontName=BODY_FONT, fontSize=10, leading=15,
    textColor=TEXT_PRIM, leftIndent=18, rightIndent=20)
style_toc3 = ParagraphStyle('TOC3',
    fontName=BODY_FONT, fontSize=9.5, leading=13,
    textColor=TEXT_MUTED, leftIndent=36, rightIndent=20)

# ── TocDocTemplate ─────────────────────────────────────────────────────
class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text  = getattr(flowable, 'bookmark_text', '')
            key   = getattr(flowable, 'bookmark_key', '')
            self.notify('TOCEntry', (level, text, self.page, key))

# ── Header / Footer canvas callback ────────────────────────────────────
def on_page(canvas, doc):
    canvas.saveState()
    # Top rule
    canvas.setStrokeColor(NAVY)
    canvas.setLineWidth(0.6)
    canvas.line(LEFT_M, PAGE_H - TOP_M + 18, PAGE_W - RIGHT_M, PAGE_H - TOP_M + 18)
    # Header text — left
    canvas.setFont(BODY_ITAL, 8)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawString(LEFT_M, PAGE_H - TOP_M + 24,
                      'PRD — Sistem Dashboard Pemantauan Bersepadu JTM')
    # Header text — right (org)
    canvas.setFont(SANS_FONT, 8)
    canvas.setFillColor(NAVY)
    canvas.drawRightString(PAGE_W - RIGHT_M, PAGE_H - TOP_M + 24,
                           'Jabatan Tenaga Manusia (JTM)')
    # Bottom rule
    canvas.setStrokeColor(RULE_SOFT)
    canvas.setLineWidth(0.4)
    canvas.line(LEFT_M, BOT_M - 18, PAGE_W - RIGHT_M, BOT_M - 18)
    # Footer left — page number (body page +1 → final page = cover(1) + body page)
    final_page = doc.page + 1
    canvas.setFont(SANS_BOLD, 8.5)
    canvas.setFillColor(NAVY)
    canvas.drawString(LEFT_M, BOT_M - 32, f'Muka Surat {final_page}')
    # Footer center — confidential note
    canvas.setFont(BODY_ITAL, 8)
    canvas.setFillColor(AMBER)
    canvas.drawCentredString(PAGE_W / 2.0, BOT_M - 32, 'Terhad  ·  Kegunaan Dalaman')
    # Footer right — doc id
    canvas.setFont(MONO_FONT, 7.5)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawRightString(PAGE_W - RIGHT_M, BOT_M - 32, 'PRD-JTM-2026-001  ·  v1.0')
    canvas.restoreState()

# ── Helpers ────────────────────────────────────────────────────────────
def _key(text):
    return 'h_' + hashlib.md5(text.encode('utf-8')).hexdigest()[:8]

def heading(text, style, level=0):
    k = _key(text + str(level))
    p = Paragraph(f'<a name="{k}"/>{text}', style)
    p.bookmark_name = k
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = k
    return p

def h1(text):
    """Major section heading — with orphan prevention."""
    avail_h = PAGE_H - TOP_M - BOT_M
    return [
        CondPageBreak(avail_h * 0.20),
        heading(text, style_h1, level=0),
        _accent_rule(width=72, thickness=2.2, color=TEAL, space_after=8),
    ]

def h2(text):
    return [heading(text, style_h2, level=1)]

def h3(text):
    return [heading(text, style_h3, level=2)]

def h4(text):
    return [Paragraph(text, style_h4)]

def body(text):
    return Paragraph(text, style_body)

def body_left(text):
    return Paragraph(text, style_body_left)

def bullet(text):
    return Paragraph(text, style_bullet, bulletText='•')

def callout(text, label='Nota'):
    """A teal-bordered callout block."""
    inner = Paragraph(f'<b>{label}:</b> {text}', style_callout)
    t = Table([[inner]], colWidths=[AVAIL_W])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), GLASS_FILL),
        ('LINEBEFORE', (0,0), (0,-1), 3, TEAL),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    return t

def kpi_box(text):
    """KPI display box — amber accent."""
    inner = Paragraph(f'<b>KPI:</b> <i>{text}</i>', style_kpi)
    t = Table([[inner]], colWidths=[AVAIL_W])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), GLASS_FILL),
        ('LINEBEFORE', (0,0), (0,-1), 3, AMBER),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    return t

class _AccentRule(Flowable):
    """A short colored rule used as a visual divider under H1 headings."""
    def __init__(self, width=72, thickness=2.0, color=TEAL, space_after=6):
        Flowable.__init__(self)
        self.width = width
        self.thickness = thickness
        self.color = color
        self.space_after = space_after
    def wrap(self, availW, availH):
        return (self.width, self.thickness + self.space_after)
    def draw(self):
        self.canv.setFillColor(self.color)
        self.canv.rect(0, self.space_after, self.width, self.thickness, fill=1, stroke=0)

def _accent_rule(width=72, thickness=2.0, color=TEAL, space_after=6):
    return _AccentRule(width, thickness, color, space_after)

def make_table(header, rows, col_ratios=None, header_align='left',
               cell_align='left', mono_cols=None, font_size=9, hcolor=NAVY):
    """Build a styled table with navy header + zebra stripes.

    header: list of header strings
    rows:   list of lists of cell strings (or Paragraphs)
    col_ratios: list of floats summing to 1.0 (column width ratios)
    mono_cols:  set of column indices to render in monospace
    """
    mono_cols = mono_cols or set()
    n_cols = len(header)
    if col_ratios is None:
        col_ratios = [1.0 / n_cols] * n_cols
    col_widths = [r * AVAIL_W for r in col_ratios]

    # Header row
    h_style = style_table_header_c if header_align == 'center' else style_table_header
    header_cells = [Paragraph(f'<b>{h}</b>', h_style) for h in header]

    # Body rows
    body_rows = []
    for row in rows:
        cells = []
        for i, c in enumerate(row):
            if isinstance(c, Paragraph):
                cells.append(c)
                continue
            if i in mono_cols:
                cells.append(Paragraph(str(c), style_table_cell_mono))
            else:
                cs = style_table_cell_c if cell_align == 'center' else style_table_cell
                cells.append(Paragraph(str(c), cs))
        body_rows.append(cells)

    data = [header_cells] + body_rows
    t = Table(data, colWidths=col_widths, hAlign='CENTER', repeatRows=1)

    ts = TableStyle([
        # Header
        ('BACKGROUND', (0,0), (-1,0), hcolor),
        ('TEXTCOLOR',  (0,0), (-1,0), colors.white),
        ('VALIGN',     (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING',  (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING',   (0,0), (-1,-1), 5),
        ('BOTTOMPADDING',(0,0), (-1,-1), 5),
        ('TOPPADDING',   (0,0), (-1,0), 6),
        ('BOTTOMPADDING',(0,0), (-1,0), 6),
        # Grid
        ('LINEBELOW', (0,0), (-1,0), 1.0, NAVY),
        ('LINEABOVE', (0,0), (-1,0), 0.8, NAVY),
        ('INNERGRID', (0,1), (-1,-1), 0.25, RULE_SOFT),
        ('BOX',       (0,0), (-1,-1), 0.6, NAVY),
    ])
    # Zebra stripes
    for i in range(1, len(data)):
        if i % 2 == 1:
            ts.add('BACKGROUND', (0,i), (-1,i), TABLE_ROW_ODD)
        else:
            ts.add('BACKGROUND', (0,i), (-1,i), TABLE_ROW_EVEN)
    t.setStyle(ts)
    return t

def code_block(text, language=None, caption=None):
    """Render a monospace code block with light gray background and border.

    Uses Preformatted directly (not wrapped in Table) so the block can
    split across pages when content is taller than one page.
    """
    # Strip leading newline, ensure trailing newline
    text = text.lstrip('\n').rstrip() + '\n'
    pre = Preformatted(text, style_code)
    out = [Spacer(1, 4), pre]
    if caption:
        out.append(Spacer(1, 3))
        out.append(Paragraph(f'<i>{caption}</i>', style_caption))
    out.append(Spacer(1, 6))
    return out

def vis_block(text):
    """A 'Visualization' / 'Visualisasi Dashboard' callout — light teal tinted box."""
    inner = Paragraph(f'<b><font color="#0E8388">Visualisasi Dashboard:</font></b> {text}',
                      ParagraphStyle('Vis', fontName=BODY_FONT, fontSize=9.5, leading=13,
                                     textColor=TEXT_PRIM, alignment=TA_LEFT))
    t = Table([[inner]], colWidths=[AVAIL_W])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#eaf4f4')),
        ('LINEBEFORE', (0,0), (0,-1), 3, TEAL),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING',(0,0), (-1,-1), 5),
    ]))
    return t

def user_story(text):
    """User Story block — italic with navy accent."""
    inner = Paragraph(f'<b>User Story:</b> <i>{text}</i>',
                      ParagraphStyle('US', fontName=BODY_FONT, fontSize=10, leading=14,
                                     textColor=NAVY, alignment=TA_LEFT))
    t = Table([[inner]], colWidths=[AVAIL_W])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f0f4fa')),
        ('LINEBEFORE', (0,0), (0,-1), 3, NAVY),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING',(0,0), (-1,-1), 5),
    ]))
    return t

def supabase_table_ref(name):
    """Inline reference to a Supabase table — monospace badge."""
    return Paragraph(
        f'<b>Jadual Supabase:</b> <font name="{MONO_FONT}" color="#0B2545">{name}</font>',
        ParagraphStyle('TblRef', fontName=BODY_FONT, fontSize=10, leading=14,
                       textColor=TEXT_PRIM, alignment=TA_LEFT,
                       spaceBefore=2, spaceAfter=2))

# ── Story content ──────────────────────────────────────────────────────
story = []

# ─── TOC PAGE ──────────────────────────────────────────────────────────
toc_title_style = ParagraphStyle('TOCTitle',
    fontName=SANS_BOLD, fontSize=20, leading=26,
    textColor=NAVY, alignment=TA_LEFT, spaceBefore=0, spaceAfter=4)
toc_sub_style = ParagraphStyle('TOCSub',
    fontName=BODY_ITAL, fontSize=10, leading=14,
    textColor=TEXT_MUTED, alignment=TA_LEFT, spaceBefore=0, spaceAfter=14)

story.append(Paragraph('Isi Kandungan', toc_title_style))
story.append(_accent_rule(width=72, thickness=2.2, color=TEAL, space_after=4))
story.append(Paragraph('Table of Contents  ·  Sistem Dashboard Pemantauan Bersepadu JTM',
                       toc_sub_style))

toc = TableOfContents()
toc.levelStyles = [style_toc1, style_toc2, style_toc3]
story.append(toc)
story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════════════
# 1. PENGENALAN
# ═══════════════════════════════════════════════════════════════════════
story.extend(h1('1.  Pengenalan'))

story.extend(h2('1.1  Latar Belakang'))
story.append(body(
    'Jabatan Tenaga Manusia (JTM) melalui rangkaian Institut Latihan Perindustrian (ILP) dan '
    'Institut Kemahiran Mahir (IKM) di seluruh Malaysia menguruskan pelbagai aspek operasi harian '
    'merangkumi akademik, kewangan, aset dan sumber manusia. Pada masa kini, pemantauan bagi '
    'setiap aspek ini dijalankan secara berasingan menggunakan sistem legasi dan hamparan Excel '
    'manual, menyebabkan kesukaran mendapatkan gambaran menyeluruh (<i>single source of truth</i>) '
    'bagi membuat keputusan strategik secara tepat pada masanya.'))
story.append(body(
    'Sistem Dashboard Pemantauan Bersepadu dicadangkan untuk menggabungkan 14 domain pemantauan '
    'kritikal ke dalam satu platform digital tunggal yang responsif, selamat dan mesra pengguna, '
    'dibina menggunakan seni bina moden berasaskan awan (<i>cloud-native</i>).'))

story.extend(h2('1.2  Objektif Projek'))
for line in [
    'Menyediakan satu platform dashboard bersepadu bagi memantau prestasi akademik, kewangan, aset '
    'dan sumber manusia ILP/IKM secara masa nyata (<i>real-time</i>).',
    'Mengautomasikan pengiraan KPI dan penjanaan amaran (<i>alert</i>) bagi perkara kritikal seperti '
    'tarikh luput pentauliahan program dan pematuhan bajet.',
    'Mengurangkan pergantungan kepada proses manual berasaskan Excel dan e-mel bagi pelaporan pengurusan.',
    'Menyediakan antara muka pengguna moden bergaya <i>Glassmorphism</i> yang meningkatkan pengalaman '
    'pengguna (UX) golongan pentadbir dan pengurusan atasan.',
    'Membolehkan capaian sistem dari mana-mana peranti melalui pelayar web tanpa keperluan pemasangan '
    'perisian tambahan.',
    'Memanfaatkan keupayaan AI (z.ai GLM 5.2) bagi menjana ringkasan analitik, <i>insight</i> automatik '
    'dan sokongan carian bahasa semula jadi.',
]:
    story.append(bullet(line))

story.extend(h2('1.3  Skop Projek'))
story.append(body(
    'Skop pembangunan Fasa 1 merangkumi pembangunan 14 modul pemantauan dashboard seperti '
    'disenaraikan dalam Bahagian 4, lengkap dengan pangkalan data Supabase berfungsi penuh '
    '(termasuk data dummy/pra-populasi bagi tujuan demonstrasi dan ujian), reka bentuk UI/UX '
    'Glassmorphism responsif, serta penempatan (<i>deployment</i>) automatik ke persekitaran '
    'pengeluaran (<i>production</i>) di Netlify.'))
story.append(body(
    'Skop <b>TIDAK</b> termasuk (Fasa 2 dan seterusnya): modul pengurusan peperiksaan penuh, '
    'sistem e-pembelajaran (LMS), integrasi sistem gaji, dan aplikasi <i>mobile</i> native '
    '(iOS/Android).'))

story.extend(h2('1.4  Definisi & Akronim'))
story.append(make_table(
    header=['Istilah', 'Penerangan'],
    rows=[
        ['JTM', 'Jabatan Tenaga Manusia'],
        ['ILP / IKM', 'Institut Latihan Perindustrian / Institut Kemahiran Mahir'],
        ['SKM / DKM / DLKM', 'Sijil / Diploma / Diploma Lanjutan Kemahiran Malaysia'],
        ['DV', 'Dual Vocational (Pengajar Latihan Dwi Sistem)'],
        ['PRD', 'Product Requirements Document'],
        ['RLS', 'Row Level Security (kawalan akses baris data Supabase)'],
        ['SLA', 'Service Level Agreement'],
        ['GLM 5.2', 'Model bahasa besar (LLM) terbitan z.ai digunakan sebagai enjin pembangunan & analitik AI'],
        ['CI/CD', 'Continuous Integration / Continuous Deployment'],
        ['OS28000 / OS26000', 'Kod Objek Am Bajet Mengurus (Penyelenggaraan / Bekalan)'],
    ],
    col_ratios=[0.30, 0.70],
))
story.append(Spacer(1, 6))

# ═══════════════════════════════════════════════════════════════════════
# 2. PEMEGANG TARUH & PERANAN PENGGUNA
# ═══════════════════════════════════════════════════════════════════════
story.extend(h1('2.  Pemegang Taruh & Peranan Pengguna'))
story.append(body(
    'Sistem akan menggunakan kawalan akses berasaskan peranan (<i>Role-Based Access Control</i>) '
    'yang dikuatkuasakan melalui Supabase Auth dan <b>Row Level Security (RLS)</b>. Lima peranan '
    'utama ditakrifkan seperti berikut:'))
story.append(make_table(
    header=['Peranan', 'Capaian Sistem', 'Contoh Pengguna'],
    rows=[
        ['Super Admin',
         'Capaian penuh semua modul, pengurusan pengguna & tetapan sistem',
         'Pengarah ICT / Pentadbir Sistem'],
        ['Pengurus Kanan (Top Management)',
         'Papar sahaja (read-only) — semua 14 modul dashboard peringkat ringkasan',
         'Pengarah ILP/IKM, Timbalan Pengarah'],
        ['Pengurus Unit/Bahagian',
         'Papar & urus data bagi modul di bawah bidang kuasa sahaja',
         'Pengurus Akademik, Pengurus Kewangan, Pengurus Aset'],
        ['Pegawai Input Data',
         'Kemasukan & kemas kini data mentah bagi modul berkaitan',
         'Pegawai Rekod, Pegawai Stor, Pegawai ICT'],
        ['Pelawat/Auditor (Guest)',
         'Papar laporan terpilih sahaja, tiada capaian kemas kini',
         'Pihak Audit Dalaman/Luaran'],
    ],
    col_ratios=[0.24, 0.45, 0.31],
))
story.append(Spacer(1, 6))

# ═══════════════════════════════════════════════════════════════════════
# 3. SENI BINA TEKNIKAL SISTEM
# ═══════════════════════════════════════════════════════════════════════
story.extend(h1('3.  Seni Bina Teknikal Sistem'))

story.extend(h2('3.1  Ringkasan Tumpukan Teknologi (Tech Stack)'))
story.append(make_table(
    header=['Lapisan', 'Teknologi', 'Catatan'],
    rows=[
        ['Enjin Pembangunan AI', 'z.ai — Model GLM 5.2',
         'Digunakan sebagai pair-programmer untuk penjanaan kod frontend/backend dan enjin analitik/insight dalam aplikasi'],
        ['Frontend Framework', 'React 18 + Vite / Next.js (Static Export)',
         'Serasi penuh dengan pelan penempatan Netlify (JAMstack)'],
        ['Reka Bentuk UI', 'TailwindCSS + Custom Glassmorphism Design System',
         'Lihat Bahagian 6'],
        ['Carta & Visualisasi', 'Recharts / Chart.js',
         'Carta responsif untuk semua 14 modul'],
        ['Backend-as-a-Service', 'Supabase (PostgreSQL 15)',
         'Auth, Database, Storage, Realtime, Edge Functions'],
        ['Pengesahan Pengguna', 'Supabase Auth (Email/Password + Magic Link + SSO pilihan)',
         'Disokong Row Level Security (RLS)'],
        ['API Layer', 'Supabase Auto-generated REST/GraphQL + PostgREST',
         'Edge Functions (Deno) untuk logik custom'],
        ['Hosting / Deployment', 'Netlify (Build & Deploy CI/CD)',
         'Sambungan terus ke repositori Git'],
        ['Kawalan Versi', 'Git (GitHub/GitLab)',
         'Deploy preview automatik setiap Pull Request'],
        ['Pemantauan & Log', 'Netlify Analytics + Supabase Logs',
         'Pemantauan prestasi & ralat'],
    ],
    col_ratios=[0.22, 0.32, 0.46],
))
story.append(Spacer(1, 6))

story.extend(h2('3.2  Rajah Seni Bina Sistem (Architecture Overview)'))
story.append(body(
    'Seni bina sistem mengikut corak <b>Jamstack tiga lapisan</b> berikut: pengguna mengakses '
    'frontend yang dihoskan di Netlify, frontend berkomunikasi dengan platform Supabase melalui '
    'SDK JavaScript, dan Supabase Edge Function berfungsi sebagai perantara selamat bagi panggilan '
    'API z.ai GLM 5.2.'))
story.extend(code_block("""┌─────────────────────────────────────────────────────────┐
│   PENGGUNA (Web Browser — Desktop / Tablet / Mobile)    │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼─────────────────────────────┐
│  FRONTEND — React/Next.js + Tailwind (Glassmorphism UI) │
│  Dihoskan & di-CI/CD-kan melalui NETLIFY                 │
└───────────────────────────┬─────────────────────────────┘
                            │ Supabase JS Client SDK (REST/Realtime)
┌───────────────────────────▼─────────────────────────────┐
│                    SUPABASE PLATFORM                     │
│  ┌───────────┐ ┌───────────┐ ┌──────────┐ ┌──────────┐  │
│  │   Auth    │ │ PostgreSQL│ │ Storage  │ │Edge Func │  │
│  │ (JWT/RLS) │ │  Database │ │  (Fail)  │ │ (Deno/API)│  │
│  └───────────┘ └───────────┘ └──────────┘ └─────┬────┘  │
└──────────────────────────────────────────────────┼───────┘
                                                  │ API Key
                                       ┌──────────▼──────────┐
                                       │  z.ai GLM 5.2 API   │
                                       │  (Insight & Chat AI) │
                                       └─────────────────────┘"""))

story.extend(h2('3.3  Aliran Data (Data Flow)'))
for i, line in enumerate([
    '<b>Langkah 1:</b> Pengguna log masuk melalui Supabase Auth; token JWT dijana dan disimpan pada sesi pelayar.',
    '<b>Langkah 2:</b> Frontend memanggil API Supabase (PostgREST) untuk mendapatkan/menghantar data mengikut kebenaran RLS peranan pengguna.',
    '<b>Langkah 3:</b> Data agregat (KPI, jumlah, peratus) dikira sama ada melalui SQL View/Materialized View di Supabase atau Edge Function.',
    '<b>Langkah 4:</b> Modul <i>AI Insight</i> menghantar ringkasan data (bukan data mentah sensitif) ke z.ai GLM 5.2 API melalui Edge Function bagi menjana naratif analitik automatik dalam Bahasa Malaysia.',
    '<b>Langkah 5:</b> Sebarang kemas kini data (contoh: rekod aduan baharu) dipapar secara masa nyata pada dashboard lain menggunakan ciri Supabase Realtime (WebSocket).',
]):
    story.append(bullet(line))

story.extend(h2('3.4  Integrasi AI — z.ai GLM 5.2'))
story.append(body(
    'Model <b>GLM 5.2</b> daripada z.ai akan digunakan pada dua peringkat:'))
story.append(bullet(
    '<b>Peringkat Pembangunan (<i>Development-time</i>):</b> Sebagai alat bantuan pembangunan '
    '(<i>AI pair-programmer</i>) untuk menjana kod komponen React, fungsi SQL, dan skrip Edge '
    'Function berdasarkan spesifikasi PRD ini.'))
story.append(bullet(
    '<b>Peringkat Masa Jalan (<i>Runtime</i>):</b> Sebagai enjin <i>AI Insight Generator</i> '
    'terbenam dalam dashboard — menjana ringkasan naratif automatik (contoh: "Enrolmen Sesi Jun '
    'menurun 8% berbanding sesi lepas terutama di ILP Selayang") dan menyokong ciri carian bahasa '
    'semula jadi (<i>natural language query</i>) ke atas data dashboard.'))
story.append(callout(
    'Kunci API GLM 5.2 disimpan sebagai pembolehubah persekitaran (<i>environment variable</i>) '
    'di sisi pelayan (Supabase Edge Function) dan tidak sekali-kali didedahkan pada kod sisi klien '
    '(frontend).', label='Nota Keselamatan'))

# ═══════════════════════════════════════════════════════════════════════
# 4. KEPERLUAN FUNGSIONAL — MODUL DASHBOARD
# ═══════════════════════════════════════════════════════════════════════
story.extend(h1('4.  Keperluan Fungsian — Modul Dashboard'))
story.append(body(
    'Bahagian ini menghuraikan <b>14 modul pemantauan</b> yang membentuk teras Sistem Dashboard '
    'Pemantauan Bersepadu. Setiap modul dipetakan kepada satu atau lebih jadual Supabase, '
    'disertakan medan data, jenis visualisasi dan KPI berkaitan.'))

story.append(callout(
    'Halaman utama memaparkan <i>Ringkasan Eksekutif</i> dalam bentuk kad KPI (<i>KPI cards</i>) '
    'merentasi kesemua 14 modul, dengan navigasi sisi (<i>sidebar</i>) beralun kaca '
    '(<i>glass sidebar</i>) untuk capaian pantas ke setiap modul terperinci.',
    label='Papan Pemuka Utama (Landing Dashboard)'))

# ── FR-01 .. FR-14 ────────────────────────────────────────────────────
def fr_block(code, title, description, user_story_text, fields_table, table_ref,
             visualization, kpi_text):
    """Standard structure for each functional requirement module."""
    out = []
    out.extend(h3(f'{code}  —  {title}'))
    out.append(body(description))
    out.append(user_story(user_story_text))
    out.append(Spacer(1, 4))
    out.append(Paragraph('<b>Medan Data Utama (<i>Key Data Fields</i>):</b>',
                         ParagraphStyle('F', fontName=SANS_BOLD, fontSize=10, leading=14,
                                        textColor=NAVY, alignment=TA_LEFT, spaceBefore=4, spaceAfter=4)))
    out.append(fields_table)
    out.append(Spacer(1, 4))
    out.append(supabase_table_ref(table_ref))
    out.append(Spacer(1, 4))
    out.append(vis_block(visualization))
    out.append(Spacer(1, 4))
    out.append(kpi_box(kpi_text))
    out.append(Spacer(1, 8))
    return out

# FR-01
story.extend(fr_block(
    code='FR-01',
    title='Pemantauan Pengambilan & Enrolmen Pelajar Sepenuh Masa',
    description=(
        'Memaparkan perbandingan sasaran pengambilan (<i>intake</i>) berbanding bilangan pelajar '
        'yang berjaya mendaftar (<i>enrolled</i>) bagi setiap sesi pembelajaran (contoh: Sesi Jun, '
        'Sesi Disember), mengikut program dan pusat latihan.'),
    user_story_text=(
        'Sebagai Pengurus Akademik, saya ingin melihat peratus pencapaian enrolmen berbanding '
        'sasaran bagi setiap sesi supaya saya dapat merancang strategi pemasaran dan pengambilan.'),
    fields_table=make_table(
        header=['Medan', 'Jenis Data', 'Keterangan'],
        rows=[
            ['session_id',      'UUID',   'Pengenal unik sesi'],
            ['session_name',    'TEXT',   'Cth: Sesi Jun 2026'],
            ['program_id',      'UUID',   'Rujukan program'],
            ['target_intake',   'INT',    'Sasaran pengambilan'],
            ['actual_enrolled', 'INT',    'Bilangan mendaftar sebenar'],
            ['center_name',     'TEXT',   'Pusat latihan / kampus'],
            ['gender_male',     'INT',    'Bilangan pelajar lelaki'],
            ['gender_female',   'INT',    'Bilangan pelajar perempuan'],
        ],
        col_ratios=[0.28, 0.16, 0.56],
        mono_cols={0, 1},
    ),
    table_ref='tbl_enrolment_fulltime',
    visualization='Bar chart (Sasaran vs Sebenar), Line trend merentas sesi, Peratus pencapaian (%), '
                  'Peta taburan pusat latihan.',
    kpi_text='Peratus Pencapaian Enrolmen = (actual_enrolled / target_intake) × 100%',
))

# FR-02
story.extend(fr_block(
    code='FR-02',
    title='Pemantauan Aduan Pelanggan',
    description=(
        'Menjejak bilangan aduan pelanggan yang diterima, kategori aduan, status penyelesaian '
        'dan tempoh masa maklum balas berbanding SLA (<i>Service Level Agreement</i>) yang ditetapkan.'),
    user_story_text=(
        'Sebagai Pegawai Khidmat Pelanggan, saya ingin memantau tempoh maklum balas aduan secara '
        'masa nyata supaya SLA sentiasa dipatuhi.'),
    fields_table=make_table(
        header=['Medan', 'Jenis Data', 'Keterangan'],
        rows=[
            ['complaint_id',          'UUID',    'Pengenal unik aduan'],
            ['date_received',         'DATE',    'Tarikh aduan diterima'],
            ['category',              'TEXT',    'Kategori (akademik/kemudahan/kewangan)'],
            ['status',                'TEXT',    'Baharu / Dalam Tindakan / Selesai'],
            ['date_resolved',         'DATE',    'Tarikh diselesaikan'],
            ['response_time_hours',   'NUMERIC', 'Tempoh maklum balas (jam)'],
            ['sla_target_hours',      'NUMERIC', 'Sasaran SLA (jam)'],
            ['complainant_type',      'TEXT',    'Pelajar / Ibu bapa / Majikan'],
        ],
        col_ratios=[0.30, 0.16, 0.54],
        mono_cols={0, 1},
    ),
    table_ref='tbl_customer_complaints',
    visualization='Trend bilangan aduan bulanan, Gauge purata masa maklum balas, Peratus pematuhan SLA, '
                  'Pecahan mengikut kategori (donut).',
    kpi_text='Pematuhan SLA (%) = (Aduan diselesaikan dalam SLA / Jumlah aduan) × 100%',
))

# FR-03
story.extend(fr_block(
    code='FR-03',
    title='Pentauliahan Program Sepenuh Masa',
    description=(
        'Memantau status pentauliahan (<i>accreditation</i>) setiap program sepenuh masa termasuk '
        'tarikh mula sah dan tarikh luput, dengan amaran automatik bagi pentauliahan yang hampir '
        'tammat tempoh.'),
    user_story_text=(
        'Sebagai Pengurus Kualiti, saya ingin menerima amaran awal 90 hari sebelum pentauliahan '
        'program tamat tempoh supaya permohonan pembaharuan dapat dibuat tepat pada masanya.'),
    fields_table=make_table(
        header=['Medan', 'Jenis Data', 'Keterangan'],
        rows=[
            ['program_id',        'UUID', 'Pengenal unik program'],
            ['program_name',      'TEXT', 'Nama program'],
            ['accreditation_body','TEXT', 'Badan pentauliahan (cth: JPK)'],
            ['cert_no',           'TEXT', 'Nombor sijil pentauliahan'],
            ['start_date',        'DATE', 'Tarikh mula sah'],
            ['expiry_date',       'DATE', 'Tarikh luput'],
            ['status',            'TEXT', 'Aktif / Akan Luput / Luput'],
        ],
        col_ratios=[0.28, 0.16, 0.56],
        mono_cols={0, 1},
    ),
    table_ref='tbl_program_accreditation',
    visualization='Senarai status dengan badge warna (hijau/kuning/merah), Kalendar luput, '
                  'Kad amaran 90/60/30 hari.',
    kpi_text='Bilangan program berstatus "Akan Luput" dalam tempoh 90 hari',
))

# FR-04
story.extend(fr_block(
    code='FR-04',
    title='Sijil Kemahiran Malaysia (SKM) Pengajar DV',
    description=(
        'Memantau bilangan dan peratus pengajar <i>Dual Vocational</i> (DV) yang memegang Sijil '
        'Kemahiran Malaysia Tahap 3 (SKM3), Diploma Kemahiran Malaysia (DKM) dan Diploma Lanjutan '
        'Kemahiran Malaysia (DLKM).'),
    user_story_text=(
        'Sebagai Ketua Jabatan, saya ingin melihat peratus pengajar bertauliah mengikut tahap sijil '
        'untuk memastikan pematuhan piawaian latihan.'),
    fields_table=make_table(
        header=['Medan', 'Jenis Data', 'Keterangan'],
        rows=[
            ['instructor_id', 'UUID', 'Pengenal unik pengajar'],
            ['full_name',     'TEXT', 'Nama pengajar'],
            ['department',    'TEXT', 'Jabatan / Bidang'],
            ['cert_level',    'TEXT', 'SKM3 / DKM / DLKM'],
            ['cert_no',       'TEXT', 'Nombor sijil'],
            ['issue_date',    'DATE', 'Tarikh dikeluarkan'],
            ['expiry_date',   'DATE', 'Tarikh luput (jika ada)'],
        ],
        col_ratios=[0.28, 0.16, 0.56],
        mono_cols={0, 1},
    ),
    table_ref='tbl_instructor_certification',
    visualization='Donut chart peratus mengikut tahap (SKM3/DKM/DLKM), Jadual senarai pengajar belum bersijil.',
    kpi_text='Peratus Pengajar Bersijil = (Bilangan bersijil / Jumlah pengajar DV) × 100%',
))

# FR-05
story.extend(fr_block(
    code='FR-05',
    title='Pemantauan Kursus Tahunan Kakitangan (40 Jam Setahun)',
    description=(
        'Menjejak jumlah jam kursus/latihan yang telah dilengkapkan oleh setiap kakitangan '
        'berbanding sasaran minimum <b>40 jam setahun</b> seperti ditetapkan oleh JPA.'),
    user_story_text=(
        'Sebagai Pegawai Sumber Manusia, saya ingin memantau kakitangan yang belum mencapai 40 jam '
        'latihan tahunan menjelang penghujung tahun.'),
    fields_table=make_table(
        header=['Medan', 'Jenis Data', 'Keterangan'],
        rows=[
            ['staf_id',          'UUID',    'Pengenal unik kakitangan'],
            ['full_name',        'TEXT',    'Nama kakitangan'],
            ['department',       'TEXT',    'Jabatan'],
            ['year',             'INT',     'Tahun'],
            ['hours_completed',  'NUMERIC', 'Jumlah jam selesai'],
            ['target_hours',     'NUMERIC', 'Sasaran (default 40)'],
            ['last_course_date', 'DATE',    'Tarikh kursus terkini'],
        ],
        col_ratios=[0.28, 0.16, 0.56],
        mono_cols={0, 1},
    ),
    table_ref='tbl_staff_training',
    visualization='Progress bar setiap kakitangan, Peratus pematuhan jabatan, Senarai kakitangan '
                  'berisiko tidak capai sasaran.',
    kpi_text='Peratus Pematuhan = (hours_completed / 40) × 100%, dikira per kakitangan dan purata jabatan',
))

# FR-06
story.extend(fr_block(
    code='FR-06',
    title='Pemantauan Perbelanjaan Bajet Mengurus (OS28000 & OS26000)',
    description=(
        'Memantau peruntukan dan perbelanjaan bagi Objek Am <b>28000 (Penyelenggaraan)</b> dan '
        '<b>26000 (Bekalan & Bahan Guna Habis)</b> mengikut bulan.'),
    user_story_text=(
        'Sebagai Pegawai Kewangan, saya ingin melihat peratus perbelanjaan bajet mengurus secara '
        'bulanan untuk mengelakkan lebihan (<i>overspend</i>) atau bajet terbiar.'),
    fields_table=make_table(
        header=['Medan', 'Jenis Data', 'Keterangan'],
        rows=[
            ['budget_code', 'TEXT',    'Kod objek (OS28000 / OS26000)'],
            ['month',       'DATE',    'Bulan / Tahun'],
            ['allocation',  'NUMERIC', 'Peruntukan'],
            ['spent',       'NUMERIC', 'Perbelanjaan'],
            ['balance',     'NUMERIC', 'Baki'],
            ['remarks',     'TEXT',    'Catatan'],
        ],
        col_ratios=[0.26, 0.16, 0.58],
        mono_cols={0, 1},
    ),
    table_ref='tbl_budget_mengurus',
    visualization='Stacked bar peruntukan vs perbelanjaan, Trend bulanan, Gauge peratus penggunaan bajet.',
    kpi_text='Peratus Penggunaan Bajet = (spent / allocation) × 100%',
))

# FR-07
story.extend(fr_block(
    code='FR-07',
    title='Pemantauan Perbelanjaan Bajet Pembangunan (Penyelenggaraan/Naik Taraf)',
    description=(
        'Memantau status kewangan projek pembangunan seperti kerja penyelenggaraan dan naik taraf '
        'infrastruktur, termasuk peratus siap projek.'),
    user_story_text=(
        'Sebagai Pengurus Fasiliti, saya ingin memantau kemajuan kewangan dan fizikal projek naik '
        'taraf berbanding jadual yang dirancang.'),
    fields_table=make_table(
        header=['Medan', 'Jenis Data', 'Keterangan'],
        rows=[
            ['project_id',     'UUID',    'Pengenal projek'],
            ['project_name',   'TEXT',    'Nama projek'],
            ['category',       'TEXT',    'Penyelenggaraan / Naik Taraf'],
            ['allocation',     'NUMERIC', 'Peruntukan projek'],
            ['spent',          'NUMERIC', 'Perbelanjaan setakat ini'],
            ['completion_pct', 'NUMERIC', 'Peratus siap fizikal'],
            ['status',         'TEXT',    'Belum Mula / Dalam Pelaksanaan / Siap'],
            ['target_date',    'DATE',    'Tarikh siap dijadualkan'],
        ],
        col_ratios=[0.26, 0.16, 0.58],
        mono_cols={0, 1},
    ),
    table_ref='tbl_budget_pembangunan',
    visualization='Senarai kad projek dengan progress bar berkembar (kewangan & fizikal), '
                  'carta Gantt ringkas.',
    kpi_text='Indeks Prestasi Kos = spent / (allocation × completion_pct)',
))

# FR-08
story.extend(fr_block(
    code='FR-08',
    title='Pemantauan Verifikasi Stok',
    description=(
        'Menjejak proses semakan (<i>verifikasi</i>) stok fizikal berbanding rekod sistem, '
        'termasuk percanggahan (<i>variance</i>) yang dikesan.'),
    user_story_text=(
        'Sebagai Pegawai Stor, saya ingin melihat senarai item dengan percanggahan kuantiti selepas '
        'semakan stok tahunan/suku tahunan.'),
    fields_table=make_table(
        header=['Medan', 'Jenis Data', 'Keterangan'],
        rows=[
            ['item_code',    'TEXT', 'Kod item'],
            ['item_name',    'TEXT', 'Nama item'],
            ['system_qty',   'INT',  'Kuantiti mengikut sistem'],
            ['physical_qty', 'INT',  'Kuantiti fizikal disemak'],
            ['variance',     'INT',  'Percanggahan (auto-kira)'],
            ['verified_by',  'TEXT', 'Nama pegawai penyemak'],
            ['verify_date',  'DATE', 'Tarikh semakan'],
            ['status',       'TEXT', 'Sepadan / Percanggahan'],
        ],
        col_ratios=[0.26, 0.16, 0.58],
        mono_cols={0, 1},
    ),
    table_ref='tbl_stock_verification',
    visualization='Jadual percanggahan (highlight merah), Peratus item disahkan, Trend percanggahan '
                  'mengikut kategori stok.',
    kpi_text='Peratus Ketepatan Stok = (Item sepadan / Jumlah item disemak) × 100%',
))

# FR-09
story.extend(fr_block(
    code='FR-09',
    title='Enrolmen Peserta Kursus Jangka Pendek',
    description=(
        'Memantau bilangan pendaftaran peserta bagi kursus jangka pendek (<i>short course</i>) '
        'termasuk kapasiti, jenis peserta (awam/korporat) dan hasil pendapatan.'),
    user_story_text=(
        'Sebagai Pegawai Latihan Jangka Pendek, saya ingin melihat kursus paling laris dan kadar '
        'pengisian kapasiti bagi setiap kursus yang ditawarkan.'),
    fields_table=make_table(
        header=['Medan', 'Jenis Data', 'Keterangan'],
        rows=[
            ['course_id',        'UUID',    'Pengenal kursus'],
            ['course_name',      'TEXT',    'Nama kursus'],
            ['session_date',     'DATE',    'Tarikh kursus'],
            ['capacity',         'INT',     'Kapasiti maksimum'],
            ['participant_count','INT',     'Bilangan peserta didaftar'],
            ['category',         'TEXT',    'Awam / Korporat'],
            ['revenue',          'NUMERIC', 'Hasil kutipan'],
        ],
        col_ratios=[0.28, 0.16, 0.56],
        mono_cols={0, 1},
    ),
    table_ref='tbl_short_course_enrolment',
    visualization='Ranking kursus terlaris, Peratus pengisian kapasiti, Trend hasil bulanan.',
    kpi_text='Kadar Pengisian = (participant_count / capacity) × 100%',
))

# FR-10
story.extend(fr_block(
    code='FR-10',
    title='Senarai Pelajar Sepenuh Masa Bergraduat',
    description=(
        'Memaparkan senarai dan statistik pelajar sepenuh masa yang bergraduat mengikut sesi '
        'pembelajaran, termasuk status kebolehpasaran (<i>employability</i>).'),
    user_story_text=(
        'Sebagai Pengurus Akademik, saya ingin melihat bilangan graduan setiap sesi dan status '
        'pekerjaan mereka selepas tamat pengajian.'),
    fields_table=make_table(
        header=['Medan', 'Jenis Data', 'Keterangan'],
        rows=[
            ['student_id',        'UUID', 'Pengenal pelajar'],
            ['full_name',         'TEXT', 'Nama pelajar'],
            ['program_id',        'UUID', 'Rujukan program'],
            ['session_name',      'TEXT', 'Sesi pengajian'],
            ['graduation_date',   'DATE', 'Tarikh bergraduat'],
            ['final_grade',       'TEXT', 'Gred / CGPA akhir'],
            ['employment_status', 'TEXT', 'Bekerja / Belum Bekerja / Melanjut Pelajaran'],
        ],
        col_ratios=[0.28, 0.16, 0.56],
        mono_cols={0, 1},
    ),
    table_ref='tbl_graduates',
    visualization='Trend bilangan graduan per sesi, Peratus kebolehpasaran, Jadual senarai boleh '
                  'ditapis mengikut program.',
    kpi_text='Peratus Kebolehpasaran = (Bekerja dalam 6 bulan / Jumlah graduan) × 100%',
))

# FR-11
story.extend(fr_block(
    code='FR-11',
    title='Pemantauan Akaun Amanah (Perbelanjaan vs Pendapatan)',
    description=(
        'Memantau kedudukan kewangan <b>Akaun Amanah</b> dengan perbandingan pendapatan '
        '(<i>income</i>) dan perbelanjaan (<i>expense</i>) serta baki terkumpul.'),
    user_story_text=(
        'Sebagai Pegawai Kewangan Kanan, saya ingin melihat aliran tunai Akaun Amanah secara bulanan '
        'untuk memastikan kelestarian kewangan.'),
    fields_table=make_table(
        header=['Medan', 'Jenis Data', 'Keterangan'],
        rows=[
            ['transaction_id',   'UUID',    'Pengenal transaksi'],
            ['transaction_type', 'TEXT',    'Income / Expense'],
            ['category',         'TEXT',    'Kategori transaksi'],
            ['amount',           'NUMERIC', 'Jumlah (RM)'],
            ['transaction_date', 'DATE',    'Tarikh transaksi'],
            ['running_balance',  'NUMERIC', 'Baki terkumpul'],
        ],
        col_ratios=[0.30, 0.16, 0.54],
        mono_cols={0, 1},
    ),
    table_ref='tbl_trust_account',
    visualization='Carta perbandingan Pendapatan vs Perbelanjaan (bar berkembar), Trend baki (line chart).',
    kpi_text='Nisbah Kewangan = Pendapatan / Perbelanjaan  (sasaran > 1.0)',
))

# FR-12
story.extend(fr_block(
    code='FR-12',
    title='Pemantauan Akaun Mengurus (Peratus Perbelanjaan)',
    description=(
        'Memantau peratus perbelanjaan keseluruhan <b>Akaun Mengurus</b> berbanding peruntukan '
        'tahunan bagi setiap kod akaun.'),
    user_story_text=(
        'Sebagai Pengurus Kewangan, saya ingin melihat gambaran keseluruhan peratus perbelanjaan '
        'semua kod akaun mengurus dalam satu paparan ringkas.'),
    fields_table=make_table(
        header=['Medan', 'Jenis Data', 'Keterangan'],
        rows=[
            ['account_code', 'TEXT',    'Kod akaun mengurus'],
            ['account_name', 'TEXT',    'Nama akaun'],
            ['allocation',   'NUMERIC', 'Peruntukan tahunan'],
            ['spent',        'NUMERIC', 'Perbelanjaan terkini'],
            ['month',        'DATE',    'Bulan semasa'],
        ],
        col_ratios=[0.28, 0.18, 0.18, 0.18, 0.18],
        mono_cols={0, 1},
    ),
    table_ref='tbl_mengurus_account',
    visualization='Gauge/speedometer peratus perbelanjaan per kod akaun, Jadual ringkasan berwarna '
                  '(hijau <70%, kuning 70-90%, merah >90%).',
    kpi_text='Peratus Perbelanjaan = (spent / allocation) × 100%',
))

# FR-13
story.extend(fr_block(
    code='FR-13',
    title='Pemantauan Aset (Semakan Aset)',
    description=(
        'Menjejak status semakan aset alih kerajaan termasuk lokasi, keadaan fizikal dan jadual '
        'semakan berkala.'),
    user_story_text=(
        'Sebagai Pegawai Aset, saya ingin melihat senarai aset yang tertunggak semakan berkala '
        'supaya tindakan pematuhan dapat diambil.'),
    fields_table=make_table(
        header=['Medan', 'Jenis Data', 'Keterangan'],
        rows=[
            ['asset_code',      'TEXT', 'Kod pendaftaran aset (KEW.PA)'],
            ['asset_name',      'TEXT', 'Nama aset'],
            ['location',        'TEXT', 'Lokasi / Bilik'],
            ['condition',       'TEXT', 'Baik / Rosak / Perlu Baiki'],
            ['last_check_date', 'DATE', 'Tarikh semakan terakhir'],
            ['next_check_date', 'DATE', 'Tarikh semakan seterusnya'],
            ['status',          'TEXT', 'Terkini / Tertunggak'],
        ],
        col_ratios=[0.28, 0.16, 0.56],
        mono_cols={0, 1},
    ),
    table_ref='tbl_asset_monitoring',
    visualization='Peta taburan aset mengikut lokasi, Senarai aset tertunggak semakan, Pecahan '
                  'keadaan aset (pie chart).',
    kpi_text='Peratus Pematuhan Semakan = (Aset disemak tepat masa / Jumlah aset) × 100%',
))

# FR-14
story.extend(fr_block(
    code='FR-14',
    title='Pemantauan Bilangan Komputer',
    description=(
        'Memantai inventori komputer mengikut makmal/lokasi, status fungsi dan umur peralatan '
        'bagi tujuan perancangan penggantian.'),
    user_story_text=(
        'Sebagai Pegawai ICT, saya ingin melihat bilangan komputer rosak/perlu diganti mengikut '
        'makmal untuk merancang bajet penggantian.'),
    fields_table=make_table(
        header=['Medan', 'Jenis Data', 'Keterangan'],
        rows=[
            ['computer_id',   'UUID', 'Pengenal komputer'],
            ['asset_tag',     'TEXT', 'Nombor tag aset'],
            ['location',      'TEXT', 'Makmal / Lokasi'],
            ['brand_model',   'TEXT', 'Jenama & Model'],
            ['purchase_year', 'INT',  'Tahun pembelian'],
            ['status',        'TEXT', 'Berfungsi / Rosak / Penyelenggaraan'],
            ['os_version',    'TEXT', 'Versi sistem operasi'],
        ],
        col_ratios=[0.26, 0.16, 0.58],
        mono_cols={0, 1},
    ),
    table_ref='tbl_computer_inventory',
    visualization='Bilangan mengikut status (kad ringkasan), Pecahan mengikut makmal, Senarai '
                  'komputer melebihi 5 tahun (jadual penggantian).',
    kpi_text='Peratus Komputer Berfungsi = (Berfungsi / Jumlah) × 100%',
))

# ═══════════════════════════════════════════════════════════════════════
# 5. REKA BENTUK PANGKALAN DATA (SUPABASE)
# ═══════════════════════════════════════════════════════════════════════
story.extend(h1('5.  Reka Bentuk Pangkalan Data (Supabase)'))

story.extend(h2('5.1  Gambaran Keseluruhan Skema'))
story.append(body(
    'Pangkalan data direka menggunakan <b>PostgreSQL (Supabase)</b> dengan 14 jadual teras (satu '
    'bagi setiap modul), disokong oleh jadual rujukan (<i>lookup</i>) seperti '
    '<font name="DejaVuSansMono">tbl_program</font>, '
    '<font name="DejaVuSansMono">tbl_staff</font> dan '
    '<font name="DejaVuSansMono">tbl_session</font>. Setiap jadual menggunakan '
    '<font name="DejaVuSansMono">uuid</font> sebagai kunci primer, dilengkapi medan '
    '<font name="DejaVuSansMono">created_at</font> / '
    '<font name="DejaVuSansMono">updated_at</font> untuk <i>audit trail</i>.'))
story.append(make_table(
    header=['Jadual', 'Modul Berkaitan'],
    rows=[
        ['tbl_enrolment_fulltime',     'FR-01 — Pemantauan Pengambilan & Enrolmen Pelajar Sepenuh Masa'],
        ['tbl_customer_complaints',    'FR-02 — Pemantauan Aduan Pelanggan'],
        ['tbl_program_accreditation',  'FR-03 — Pentauliahan Program Sepenuh Masa'],
        ['tbl_instructor_certification','FR-04 — Sijil Kemahiran Malaysia (SKM) Pengajar DV'],
        ['tbl_staff_training',         'FR-05 — Pemantauan Kursus Tahunan Kakitangan (40 Jam Setahun)'],
        ['tbl_budget_mengurus',        'FR-06 — Pemantauan Perbelanjaan Bajet Mengurus (OS28000 & OS26000)'],
        ['tbl_budget_pembangunan',     'FR-07 — Pemantauan Perbelanjaan Bajet Pembangunan (Penyelenggaraan/Naik Taraf)'],
        ['tbl_stock_verification',     'FR-08 — Pemantauan Verifikasi Stok'],
        ['tbl_short_course_enrolment', 'FR-09 — Enrolmen Peserta Kursus Jangka Pendek'],
        ['tbl_graduates',              'FR-10 — Senarai Pelajar Sepenuh Masa Bergraduat'],
        ['tbl_trust_account',          'FR-11 — Pemantauan Akaun Amanah (Perbelanjaan vs Pendapatan)'],
        ['tbl_mengurus_account',       'FR-12 — Pemantauan Akaun Mengurus (Peratus Perbelanjaan)'],
        ['tbl_asset_monitoring',       'FR-13 — Pemantauan Aset (Semakan Aset)'],
        ['tbl_computer_inventory',     'FR-14 — Pemantauan Bilangan Komputer'],
    ],
    col_ratios=[0.36, 0.64],
    mono_cols={0},
))
story.append(Spacer(1, 6))

story.extend(h2('5.2  Dasar Keselamatan Row Level Security (RLS)'))
for line in [
    'RLS diaktifkan (<font name="DejaVuSansMono">ENABLE ROW LEVEL SECURITY</font>) pada SEMUA jadual tanpa pengecualian.',
    'Polisi <b>SELECT</b> asas: pengguna hanya boleh melihat data mengikut peranan yang ditetapkan dalam jadual <font name="DejaVuSansMono">tbl_user_roles</font>.',
    'Polisi <b>INSERT/UPDATE</b>: terhad kepada peranan Pegawai Input Data dan Pengurus Unit bagi modul berkaitan sahaja.',
    'Super Admin dikecualikan daripada sekatan RLS melalui semakan <i>custom claim</i> <font name="DejaVuSansMono">is_admin</font> pada JWT.',
]:
    story.append(bullet(line))

story.extend(h2('5.3  Strategi Data Dummy (Seed Data)'))
story.append(body(
    'Bagi memenuhi keperluan demonstrasi dan pengujian sistem sebelum integrasi data sebenar, '
    'satu skrip <font name="DejaVuSansMono">seed.sql</font> akan disediakan untuk mengisi kesemua '
    '14 jadual dengan data pura-pura (<i>dummy</i>) yang realistik — merangkumi sekurang-kurangnya '
    '3 sesi pembelajaran, 20 rekod pelajar, 10 rekod aduan, 15 rekod aset dan seumpamanya — bagi '
    'membolehkan carta dan KPI dashboard dipaparkan dengan bermakna sejak hari pertama penempatan '
    '(<i>deployment</i>).'))
story.append(body(
    'Contoh skrip SQL bagi penciptaan jadual dan data dummy disertakan dalam <b>Lampiran B</b>. '
    'Skrip penuh 14 jadual akan disediakan sebagai fail berasingan '
    '<font name="DejaVuSansMono">seed_dummy_data.sql</font> semasa fasa pembangunan.'))

story.extend(h2('5.4  Fungsi & View Agregat'))
story.append(body(
    'View SQL disyorkan bagi mempercepatkan pengiraan KPI dashboard tanpa membebankan frontend:'))
story.extend(code_block("""create or replace view public.vw_enrolment_summary as
select session_name,
       sum(target_intake)   as total_target,
       sum(actual_enrolled) as total_enrolled,
       round(100.0 * sum(actual_enrolled)
             / nullif(sum(target_intake), 0), 1) as pct_achieved
from   public.tbl_enrolment_fulltime
group  by session_name
order  by session_name;""", language='sql'))

# ═══════════════════════════════════════════════════════════════════════
# 6. REKA BENTUK UI/UX — GLASSMORPHISM
# ═══════════════════════════════════════════════════════════════════════
story.extend(h1('6.  Reka Bentuk UI/UX — Glassmorphism'))

story.extend(h2('6.1  Prinsip Reka Bentuk'))
for line in [
    'Kesan kaca legap separa (<i>frosted-glass</i>): latar belakang blur (<font name="DejaVuSansMono">backdrop-filter: blur(16-24px)</font>) dengan kelegapan (<i>opacity</i>) 60-75% pada kad dan panel.',
    'Sempadan (<i>border</i>) halus 1px berwarna putih legap rendah (<font name="DejaVuSansMono">rgba(255,255,255,0.18)</font>) untuk memberi ilusi tepi kaca.',
    'Bayang lembut (<i>soft shadow</i>) berlapis bagi kedalaman visual tanpa kesan berat.',
    'Latar belakang <i>gradient</i> dinamik (navy-ke-teal) di sebalik lapisan kaca bagi kontras optimum dan keterbacaan teks.',
    'Reka bentuk responsif sepenuhnya (<i>mobile-first</i>) — susun atur kad menyesuaikan diri dari 4 lajur (desktop) kepada 1 lajur (mobile).',
    'Mod Terang & Gelap (<i>Light/Dark Mode</i>) disokong sepenuhnya dengan pengekalan kesan kaca pada kedua-dua mod.',
]:
    story.append(bullet(line))

story.extend(h2('6.2  Palet Warna & Tipografi'))
story.append(make_table(
    header=['Elemen', 'Nilai', 'Kegunaan'],
    rows=[
        ['Warna Primer',      '#0B2545 (Navy Deep)',     'Latar utama, teks tajuk'],
        ['Warna Sekunder',    '#1B4B91 (Royal Blue)',    'Aksen, butang utama'],
        ['Warna Aksen',       '#0E8388 (Teal)',          'Highlight, status positif'],
        ['Warna Amaran',      '#C79A3B (Gold/Amber)',    'Status "Akan Luput", amaran sederhana'],
        ['Warna Kritikal',    '#D64545 (Red)',           'Status "Luput" / "Kritikal"'],
        ['Kaca (Glass Fill)', 'rgba(255,255,255,0.10–0.20)', 'Latar kad & panel'],
        ['Fon Tajuk',         'Poppins / Inter — Semi Bold', 'Tajuk modul & KPI'],
        ['Fon Kandungan',     'Inter / Calibri — Regular',   'Teks badan & jadual'],
    ],
    col_ratios=[0.24, 0.32, 0.44],
    mono_cols={1},
))
story.append(Spacer(1, 6))

story.extend(h2('6.3  Komponen Utama Antara Muka'))
for line in [
    '<b>Kad KPI Kaca (<i>Glass KPI Card</i>):</b> memaparkan satu metrik utama, ikon, nilai, dan penunjuk trend (naik/turun %).',
    '<b>Panel Carta Kaca:</b> bekas carta (Recharts) dengan latar kaca dan <i>legend</i> responsif.',
    '<b>Bar Navigasi Sisi Terapung (<i>Floating Glass Sidebar</i>):</b> senarai 14 modul dengan ikon, boleh kuncup (<i>collapsible</i>).',
    '<b>Jadual Data Responsif:</b> dengan penapis (<i>filter</i>), carian, dan eksport CSV/PDF bagi setiap modul.',
    '<b>Komponen Amaran (<i>Alert Badge</i>):</b> <i>badge</i> berwarna dinamik mengikut status ambang (<i>threshold</i>) — Hijau/Kuning/Merah.',
    '<b>Panel AI Insight (GLM 5.2):</b> kad kaca khas memaparkan ringkasan naratif automatik dan ruang input soalan bahasa semula jadi.',
]:
    story.append(bullet(line))

story.extend(h2('6.4  Susun Atur Halaman Utama (Landing Layout)'))
story.append(body('Susun atur halaman utama dashboard mengikut grid dua kawasan berikut:'))
story.extend(code_block("""┌──────────┬──────────────────────────────────────────────┐
│  LOGO    │   Tajuk: Dashboard Pemantauan Bersepadu JTM   │
│  JTM     │                              [Profil] [Notis] │
├──────────┼──────────────────────────────────────────────┤
│ Sidebar  │  ┌──── AI Insight Panel (Glass) ──────────┐ │
│ (Glass)  │  │ "Enrolmen sesi ini meningkat 6%..."    │ │
│          │  └────────────────────────────────────────┘ │
│ • FR-01  │  ┌──────┐┌──────┐┌──────┐┌──────┐           │
│ • FR-02  │  │KPI 1 ││KPI 2 ││KPI 3 ││KPI 4 │ (Glass)  │
│ • FR-03  │  └──────┘└──────┘└──────┘└──────┘           │
│ ...      │  ┌────────────────┐  ┌────────────────┐     │
│ • FR-14  │  │  Carta Trend   │  │  Carta Status  │     │
│          │  └────────────────┘  └────────────────┘     │
└──────────┴──────────────────────────────────────────────┘"""))

# ═══════════════════════════════════════════════════════════════════════
# 7. KEPERLUAN BUKAN FUNGSIAN
# ═══════════════════════════════════════════════════════════════════════
story.extend(h1('7.  Keperluan Bukan Fungsian'))
story.append(body(
    'Keperluan bukan fungsian berikut mentakrifkan kriteria kualiti yang mesti dipenuhi oleh sistem '
    'merentasi lapan dimensi: keselamatan, prestasi, kebolehskalaan, ketersediaan, kebolehcapaian, '
    'pematuhan data, kebolehselenggaraan, serta log & <i>audit trail</i>.'))
story.append(make_table(
    header=['Kategori', 'Keperluan'],
    rows=[
        ['Keselamatan',
         'Pengesahan JWT melalui Supabase Auth, RLS pada semua jadual, penyulitan HTTPS/TLS 1.3 end-to-end, kunci API GLM 5.2 disimpan di Edge Function sahaja.'],
        ['Prestasi',
         'Masa muat halaman < 2.5 saat (First Contentful Paint) pada rangkaian 4G; carta dimuat secara lazy-load.'],
        ['Kebolehskalaan',
         'Seni bina serverless (Supabase + Netlify Functions) membolehkan penskalaan automatik mengikut beban.'],
        ['Ketersediaan',
         'Sasaran waktu operasi (uptime) 99.5% menerusi SLA Netlify & Supabase managed hosting.'],
        ['Kebolehcapaian (Accessibility)',
         'Pematuhan asas WCAG 2.1 AA — kontras warna mencukupi walaupun pada kesan kaca legap.'],
        ['Pematuhan Data',
         'Selari dengan Akta Perlindungan Data Peribadi (PDPA) 2010 bagi pengendalian data pelajar & kakitangan.'],
        ['Kebolehselenggaraan',
         'Kod sumber diselenggara mengikut struktur modular (component-based) dengan dokumentasi README bagi setiap modul.'],
        ['Log & Audit Trail',
         'Setiap transaksi CUD (Create/Update/Delete) direkod dalam jadual tbl_audit_log dengan id pengguna & cap masa.'],
    ],
    col_ratios=[0.26, 0.74],
))
story.append(Spacer(1, 6))

# ═══════════════════════════════════════════════════════════════════════
# 8. PELAN PENEMPATAN (DEPLOYMENT PLAN)
# ═══════════════════════════════════════════════════════════════════════
story.extend(h1('8.  Pelan Penempatan (Deployment Plan)'))

story.extend(h2('8.1  Persekitaran Supabase'))
for line in [
    'Cipta projek Supabase baharu (Region: Singapore — <font name="DejaVuSansMono">ap-southeast-1</font> untuk kependaman rendah dari Malaysia).',
    'Jalankan skrip migrasi <font name="DejaVuSansMono">schema.sql</font> untuk mencipta 14 jadual teras + jadual rujukan.',
    'Jalankan skrip <font name="DejaVuSansMono">seed_dummy_data.sql</font> untuk mengisi data dummy awal.',
    'Konfigurasikan dasar RLS bagi setiap jadual mengikut Bahagian 5.2.',
    'Aktifkan Supabase Auth (Email/Password) dan konfigurasikan templat e-mel dalam Bahasa Malaysia.',
    'Cipta Edge Function <font name="DejaVuSansMono">ai-insight</font> untuk pengendalian panggilan API z.ai GLM 5.2 secara selamat di sisi pelayan.',
]:
    story.append(bullet(line))

story.extend(h2('8.2  Persekitaran Netlify'))
for line in [
    'Sambungkan repositori Git (GitHub) projek frontend ke Netlify melalui <i>Import from Git</i>.',
    'Konfigurasikan Build Command: <font name="DejaVuSansMono">npm run build</font>; Publish Directory: <font name="DejaVuSansMono">dist/</font> atau <font name="DejaVuSansMono">.next/</font> (mengikut framework dipilih).',
    'Tetapkan pembolehubah persekitaran (Environment Variables) di Netlify: <font name="DejaVuSansMono">VITE_SUPABASE_URL</font>, <font name="DejaVuSansMono">VITE_SUPABASE_ANON_KEY</font> (kunci awam sahaja).',
    'Aktifkan <i>Deploy Previews</i> automatik bagi setiap Pull Request untuk semakan sebelum penggabungan (<i>merge</i>) ke cawangan utama (<i>main</i>).',
    'Konfigurasikan domain kustom (contoh: <font name="DejaVuSansMono">dashboard.jtm.gov.my</font>) dengan sijil SSL percuma Netlify (Let\u2019s Encrypt).',
    'Aktifkan Netlify Forms/Functions sekiranya diperlukan bagi ciri tambahan seperti notifikasi e-mel.',
]:
    story.append(bullet(line))

story.extend(h2('8.3  Aliran Kerja CI/CD'))
story.append(body('Aliran kerja CI/CD mengikut jujukan langkah berikut:'))
story.extend(code_block("""Developer Push  ──▶  GitHub (branch: feature/*)
                          │
                          ▼
                  Netlify Auto-Build (npm install → npm run build)
                          │
                          ▼
                  Deploy Preview URL dijana  ──▶  Semakan QA/UAT
                          │   (selepas kelulusan)
                          ▼
                  Merge ke 'main'  ──▶  Netlify Production Deploy
                          │
                          ▼
                  Sistem Langsung (Live) di domain pengeluaran"""))

# ═══════════════════════════════════════════════════════════════════════
# 9. PELAN PENGUJIAN (TESTING PLAN)
# ═══════════════════════════════════════════════════════════════════════
story.extend(h1('9.  Pelan Pengujian (Testing Plan)'))
story.append(body(
    'Pelan pengujian meliputi enam jenis ujian daripada peringkat unit sehingga penerimaan '
    'pengguna (UAT), bagi memastikan kualiti sistem menyeluruh sebelum penempatan produksi:'))
story.append(make_table(
    header=['Jenis Ujian', 'Skop', 'Alat / Kaedah'],
    rows=[
        ['Ujian Unit',
         'Fungsi pengiraan KPI & komponen React individu',
         'Vitest / Jest'],
        ['Ujian Integrasi',
         'Interaksi frontend ↔ Supabase API',
         'Playwright / Postman'],
        ['Ujian RLS Keselamatan',
         'Sahkan setiap peranan hanya capai data dibenarkan',
         'Manual + Automated Test Script'],
        ['Ujian Responsif UI',
         'Kesahihan kesan Glassmorphism merentasi peranti',
         'BrowserStack / Chrome DevTools'],
        ['Ujian Prestasi',
         'Beban serentak & masa tindak balas dashboard',
         'Lighthouse / k6'],
        ['Ujian Penerimaan Pengguna (UAT)',
         'Pengesahan oleh wakil setiap Bahagian (Akademik, Kewangan, Aset, ICT)',
         'Sesi UAT berstruktur'],
    ],
    col_ratios=[0.28, 0.46, 0.26],
))
story.append(Spacer(1, 6))

# ═══════════════════════════════════════════════════════════════════════
# 10. GARIS MASA PROJEK & PENCAPAIAN UTAMA
# ═══════════════════════════════════════════════════════════════════════
story.extend(h1('10.  Garis Masa Projek & Pencapaian Utama'))
story.append(body(
    'Projek dijangka siap dalam tempoh <b>13 minggu</b> melalui tujuh fasa berurutan, bermula '
    'dengan persediaan projek dan berakhir dengan penempatan produksi serta serah terima sistem:'))
story.append(make_table(
    header=['Fasa', 'Aktiviti Utama', 'Tempoh Anggaran'],
    rows=[
        ['Fasa 0', 'Persediaan projek: setup Supabase, Netlify, repositori Git, kelulusan PRD', 'Minggu 1'],
        ['Fasa 1', 'Reka bentuk skema pangkalan data & UI/UX Glassmorphism (wireframe & prototaip)', 'Minggu 2–3'],
        ['Fasa 2', 'Pembangunan 14 modul dashboard (menggunakan z.ai GLM 5.2 sebagai enjin bantuan pembangunan)', 'Minggu 4–8'],
        ['Fasa 3', 'Integrasi data dummy, panel AI Insight, dan RLS keselamatan', 'Minggu 9–10'],
        ['Fasa 4', 'Ujian QA menyeluruh (unit, integrasi, keselamatan, prestasi)', 'Minggu 11'],
        ['Fasa 5', 'UAT bersama pemegang taruh & pembetulan (bug-fixing)', 'Minggu 12'],
        ['Fasa 6', 'Penempatan produksi ke Netlify & serah terima sistem', 'Minggu 13'],
    ],
    col_ratios=[0.12, 0.66, 0.22],
))
story.append(Spacer(1, 6))

# ═══════════════════════════════════════════════════════════════════════
# 11. RISIKO & STRATEGI MITIGASI
# ═══════════════════════════════════════════════════════════════════════
story.extend(h1('11.  Risiko & Strategi Mitigasi'))
story.append(body(
    'Lima risiko utama telah dikenalpasti berserta impak dan strategi mitigasi yang sepadan:'))
story.append(make_table(
    header=['Risiko', 'Impak', 'Mitigasi'],
    rows=[
        ['Kelewatan pembekalan data sebenar daripada Bahagian berkaitan',
         'Sederhana',
         'Gunakan data dummy realistik semasa fasa pembangunan & UAT; integrasi data sebenar dijadualkan berasingan'],
        ['Had kuota/kos panggilan API z.ai GLM 5.2',
         'Rendah–Sederhana',
         'Cache respons AI Insight (contoh: kemas kini setiap 6 jam, bukan setiap muat halaman) untuk kawal kos'],
        ['Kebocoran data akibat konfigurasi RLS tidak lengkap',
         'Tinggi',
         'Semakan keselamatan (security review) wajib sebelum setiap deployment produksi'],
        ['Prestasi terjejas pada peranti mudah alih akibat kesan blur Glassmorphism',
         'Rendah',
         'Optimum backdrop-filter & sediakan fallback solid-color bagi peranti prestasi rendah'],
        ['Pertindihan skop dengan sistem legasi sedia ada',
         'Sederhana',
         'Pemetaan skop jelas dalam Bahagian 1.3; libatkan pemilik sistem legasi awal projek'],
    ],
    col_ratios=[0.32, 0.16, 0.52],
))
story.append(Spacer(1, 6))

# ═══════════════════════════════════════════════════════════════════════
# 12. LAMPIRAN
# ═══════════════════════════════════════════════════════════════════════
story.extend(h1('12.  Lampiran'))

story.extend(h2('Lampiran A — Rumusan 14 Modul Dashboard'))
story.append(make_table(
    header=['Kod', 'Modul'],
    rows=[
        ['FR-01', 'Pemantauan Pengambilan & Enrolmen Pelajar Sepenuh Masa'],
        ['FR-02', 'Pemantauan Aduan Pelanggan'],
        ['FR-03', 'Pentauliahan Program Sepenuh Masa'],
        ['FR-04', 'Sijil Kemahiran Malaysia (SKM) Pengajar DV'],
        ['FR-05', 'Pemantauan Kursus Tahunan Kakitangan (40 Jam Setahun)'],
        ['FR-06', 'Pemantauan Perbelanjaan Bajet Mengurus (OS28000 & OS26000)'],
        ['FR-07', 'Pemantauan Perbelanjaan Bajet Pembangunan (Penyelenggaraan/Naik Taraf)'],
        ['FR-08', 'Pemantauan Verifikasi Stok'],
        ['FR-09', 'Enrolmen Peserta Kursus Jangka Pendek'],
        ['FR-10', 'Senarai Pelajar Sepenuh Masa Bergraduat'],
        ['FR-11', 'Pemantauan Akaun Amanah (Perbelanjaan vs Pendapatan)'],
        ['FR-12', 'Pemantauan Akaun Mengurus (Peratus Perbelanjaan)'],
        ['FR-13', 'Pemantauan Aset (Semakan Aset)'],
        ['FR-14', 'Pemantauan Bilangan Komputer'],
    ],
    col_ratios=[0.14, 0.86],
    mono_cols={0},
))
story.append(Spacer(1, 8))

story.extend(h2('Lampiran B — Contoh Skrip SQL (Skema & Data Dummy)'))
story.append(body(
    'Contoh berikut menggambarkan corak (<i>pattern</i>) yang akan digunakan bagi kesemua 14 jadual. '
    'Skrip penuh akan disediakan dalam fail berasingan semasa fasa pembangunan.'))
story.extend(code_block("""-- ============================================================
-- DUMMY / SEED DATA — Sistem Dashboard Pemantauan Bersepadu
-- Skema: public  |  Platform: Supabase (PostgreSQL 15)
-- ============================================================

create table public.tbl_enrolment_fulltime (
  id              uuid primary key default gen_random_uuid(),
  session_name    text not null,
  program_id      uuid references public.tbl_program(id),
  target_intake   int  not null default 0,
  actual_enrolled int  not null default 0,
  center_name     text,
  gender_male     int  default 0,
  gender_female   int  default 0,
  created_at      timestamptz default now()
);

insert into public.tbl_enrolment_fulltime
  (session_name, target_intake, actual_enrolled, center_name, gender_male, gender_female)
values
  ('Sesi Jun 2026',      120, 108, 'ILP Kuala Lumpur', 70, 38),
  ('Sesi Disember 2025', 100,  96, 'ILP Kuala Lumpur', 60, 36),
  ('Sesi Jun 2025',      110,  82, 'ILP Selayang',     55, 27);

create table public.tbl_customer_complaints (
  id                   uuid primary key default gen_random_uuid(),
  date_received        date not null,
  category             text not null,
  status               text not null default 'Baharu',
  date_resolved        date,
  response_time_hours  numeric,
  sla_target_hours     numeric default 72,
  complainant_type     text,
  created_at           timestamptz default now()
);

insert into public.tbl_customer_complaints
  (date_received, category, status, date_resolved, response_time_hours, complainant_type)
values
  ('2026-06-02', 'Akademik',   'Selesai',        '2026-06-04', 48,   'Pelajar'),
  ('2026-06-10', 'Kemudahan',  'Dalam Tindakan',  null,         null, 'Ibu Bapa'),
  ('2026-06-18', 'Kewangan',   'Selesai',        '2026-06-19', 24,   'Pelajar');

create table public.tbl_instructor_certification (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null,
  department    text,
  cert_level    text check (cert_level in ('SKM3','DKM','DLKM')),
  cert_no       text,
  issue_date    date,
  expiry_date   date,
  created_at    timestamptz default now()
);

insert into public.tbl_instructor_certification
  (full_name, department, cert_level, cert_no, issue_date)
values
  ('Ahmad Bin Zulkifli',      'Teknologi Automotif', 'DKM',  'DKM-2023-0451', '2023-03-14'),
  ('Nurul Aini Binti Hassan', 'Teknologi Elektrik',  'SKM3', 'SKM3-2022-1187','2022-08-02'),
  ('Rajesh a/l Kumar',        'Teknologi Maklumat',  'DLKM', 'DLKM-2024-0092','2024-01-20');

create table public.tbl_asset_monitoring (
  id              uuid primary key default gen_random_uuid(),
  asset_code      text unique not null,
  asset_name      text not null,
  location        text,
  condition       text check (condition in ('Baik','Perlu Baiki','Rosak')),
  last_check_date date,
  next_check_date date,
  created_at      timestamptz default now()
);

insert into public.tbl_asset_monitoring
  (asset_code, asset_name, location,
   condition, last_check_date, next_check_date)
values
  ('KEW.PA-0231', 'Projektor LCD',       'Bilik Kuliah A1',
   'Baik',        '2026-01-10', '2026-07-10'),
  ('KEW.PA-0455', 'Mesin Kimpalan CNC',  'Makmal Kimpalan 2',
   'Perlu Baiki', '2025-12-05', '2026-06-05'),
  ('KEW.PA-0678', 'Penghawa Dingin 2HP', 'Pejabat Pentadbiran',
   'Baik',        '2026-02-18', '2026-08-18');""", language='sql'))

story.extend(h2('Lampiran C — Senarai Singkatan'))
story.append(body(
    'Rujuk <b>Bahagian 1.4 — Definisi & Akronim</b> untuk senarai lengkap singkatan dan istilah '
    'teknikal yang digunakan dalam dokumen ini.'))

story.append(Spacer(1, 24))
story.append(_accent_rule(width=140, thickness=1.5, color=NAVY, space_after=4))
end_style = ParagraphStyle('End',
    fontName=BODY_ITAL, fontSize=11, leading=16,
    textColor=NAVY, alignment=TA_CENTER, spaceBefore=8, spaceAfter=4)
story.append(Paragraph('— Tamat Dokumen PRD —', end_style))
story.append(Paragraph(
    'Dokumen ini disediakan untuk Jabatan Tenaga Manusia (JTM), Kementerian Sumber Manusia Malaysia.',
    ParagraphStyle('EndSub', fontName=BODY_FONT, fontSize=9, leading=12,
                   textColor=TEXT_MUTED, alignment=TA_CENTER)))

# ── Build ──────────────────────────────────────────────────────────────
doc = TocDocTemplate(
    OUTPUT_BODY,
    pagesize=A4,
    leftMargin=LEFT_M, rightMargin=RIGHT_M,
    topMargin=TOP_M, bottomMargin=BOT_M,
    title='PRD — Sistem Dashboard Pemantauan Bersepadu JTM',
    author='Jabatan Tenaga Manusia (JTM)',
    creator='Z.ai',
    subject='Product Requirements Document — Integrated Monitoring Dashboard System (JTM)',
)

doc.multiBuild(story, onFirstPage=on_page, onLaterPages=on_page)
print(f'✅ Body PDF generated: {OUTPUT_BODY}')
