"""Gera doc-gen/Alteracao_Beneficiarios_Fontara.docx: base para o Modelo de documento
(biblioteca "Modelos de documentos" / Agreement Template Builder) da demo de alteração de beneficiários.

No editor da DocuSign, os {{Campo}} (destacados em amarelo) NÃO viram campos sozinhos: posicione o cursor
sobre cada um, insira o campo de Remetente com o mesmo nome e apague o marcador.
As 3 cláusulas da seção 03 são condicionais (ver ALTERACAO-BENEFICIARIOS-SETUP.md).
Uso: pip install python-docx && python build_alteracao_beneficiarios.py
"""
import os

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'doc-gen', 'Alteracao_Beneficiarios_Fontara.docx')
LOGO = os.path.join(HERE, 'doc-gen', 'fontara-logo.png')

INK = RGBColor(0x1E, 0x2D, 0x25)      # verde-escuro do logotipo
GREEN = RGBColor(0x1F, 0x9D, 0x6A)    # verde legível (o #36E99E do símbolo é claro demais para texto)
MUTED = RGBColor(0x6B, 0x72, 0x6E)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
FILL_SOFT = 'EEF8F3'
LINE = 'D5DDD8'

doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Cm(21), Cm(29.7)
sec.left_margin = sec.right_margin = Cm(2)
sec.top_margin, sec.bottom_margin = Cm(1.3), Cm(1.4)

base = doc.styles['Normal']
base.font.name = 'Arial'
base.element.rPr.rFonts.set(qn('w:eastAsia'), 'Arial')
base.font.size = Pt(9.5)
base.font.color.rgb = INK
base.paragraph_format.space_after = Pt(0)
base.paragraph_format.line_spacing = 1.15


def run(p, text, bold=False, size=None, color=None, italic=False):
    r = p.add_run(text)
    r.bold, r.italic = bold, italic
    if size:
        r.font.size = Pt(size)
    if color is not None:
        r.font.color.rgb = color
    return r


def para(text='', bold=False, size=None, color=None, align=None, before=0, after=0):
    p = doc.add_paragraph()
    if text:
        run(p, text, bold, size, color)
    if align is not None:
        p.alignment = align
    p.paragraph_format.space_before = Pt(before)
    p.paragraph_format.space_after = Pt(after)
    return p


def shade(cell, fill):
    tcPr = cell._tc.get_or_add_tcPr()
    sh = OxmlElement('w:shd')
    sh.set(qn('w:val'), 'clear')
    sh.set(qn('w:color'), 'auto')
    sh.set(qn('w:fill'), fill)
    tcPr.append(sh)


def borders(table, color=LINE, inside=True, outer=True):
    tblPr = table._tbl.tblPr
    b = OxmlElement('w:tblBorders')
    edges = (['top', 'bottom'] if outer else []) + (['insideH'] if inside else [])
    for edge in ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']:
        el = OxmlElement(f'w:{edge}')
        if edge in edges:
            el.set(qn('w:val'), 'single'); el.set(qn('w:sz'), '4'); el.set(qn('w:color'), color)
        else:
            el.set(qn('w:val'), 'nil')
        b.append(el)
    tblPr.append(b)


def cell_pad(cell, top=50, bottom=50, left=110, right=110):
    tcPr = cell._tc.get_or_add_tcPr()
    mar = OxmlElement('w:tcMar')
    for k, v in (('top', top), ('bottom', bottom), ('start', left), ('end', right)):
        el = OxmlElement(f'w:{k}'); el.set(qn('w:w'), str(v)); el.set(qn('w:type'), 'dxa'); mar.append(el)
    tcPr.append(mar)


def widths(table, cms):
    table.autofit = False
    for i, w in enumerate(cms):
        table.columns[i].width = Cm(w)
    for row in table.rows:
        for i, w in enumerate(cms):
            row.cells[i].width = Cm(w)


def rule(color='36E99E', size=12, before=4, after=10):
    p = para(before=before, after=after)
    pPr = p._p.get_or_add_pPr()
    pb = OxmlElement('w:pBdr')
    bot = OxmlElement('w:bottom')
    bot.set(qn('w:val'), 'single'); bot.set(qn('w:sz'), str(size)); bot.set(qn('w:color'), color)
    pb.append(bot); pPr.append(pb)


def section_title(num, text):
    p = para(before=9, after=4)
    run(p, f'{num}  ', bold=True, size=9, color=GREEN)
    run(p, text.upper(), bold=True, size=9, color=INK)


def kv_table(rows, label_w=3.6, value_w=4.9):
    """Grade 2x(rótulo, valor) com linhas finas."""
    t = doc.add_table(rows=len(rows), cols=4)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    borders(t)
    for i, pair in enumerate(rows):
        for j, (k, v) in enumerate(pair):
            kc, vc = t.rows[i].cells[j * 2], t.rows[i].cells[j * 2 + 1]
            for c in (kc, vc):
                cell_pad(c)
            run(kc.paragraphs[0], k, size=8, color=MUTED)
            run(vc.paragraphs[0], v, bold=True)
    widths(t, [label_w, value_w, label_w - 0.8, value_w + 0.8])
    return t


from docx.enum.text import WD_COLOR_INDEX


def field(p, name, bold=True, size=None):
    """Marcador de campo de Remetente, destacado em amarelo para achar no editor."""
    r = run(p, '{{' + name + '}}', bold=bold, size=size)
    r.font.highlight_color = WD_COLOR_INDEX.YELLOW
    return r


def clause(title, text, cond):
    """Cláusula condicional: título + texto (a condição é configurada no editor; ver o guia de setup)."""
    p = para(before=6, after=2)
    run(p, title, bold=True, size=9.5)
    p = para(after=2)
    run(p, text, size=9, color=MUTED)
    return cond


# ---------- Cabeçalho ----------
head_t = doc.add_table(rows=1, cols=2)
borders(head_t, inside=False, outer=False)
lc, rc = head_t.rows[0].cells
lc.paragraphs[0].add_run().add_picture(LOGO, width=Cm(4.6))
lc.vertical_alignment = rc.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
p = rc.paragraphs[0]; p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
run(p, 'ALTERAÇÃO DE BENEFICIÁRIOS', bold=True, size=13)
p = rc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
run(p, 'Protocolo ', size=9, color=MUTED); field(p, 'Protocolo', size=9)
p = rc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
run(p, 'Solicitado em ', size=8, color=MUTED); field(p, 'DataSolicitacao', bold=False, size=8)
widths(head_t, [8.5, 8.5])
rule(after=6)

para('Pelo presente termo, o(a) segurado(a)/participante identificado(a) abaixo solicita a substituição '
     'integral dos beneficiários indicados anteriormente para o plano informado, conforme as condições a seguir.',
     size=9.5, color=MUTED, after=2)

# ---------- 1. Segurado ----------
section_title('01', 'Segurado / participante')
t = doc.add_table(rows=2, cols=4)
borders(t)
cells = [('Nome completo', 'NomeSegurado'), ('CPF', 'CpfSegurado'), ('Certificado / apólice', 'Certificado'), ('Produto', 'Produto')]
for i, (k, f) in enumerate(cells):
    kc, vc = t.rows[i // 2].cells[(i % 2) * 2], t.rows[i // 2].cells[(i % 2) * 2 + 1]
    cell_pad(kc); cell_pad(vc)
    run(kc.paragraphs[0], k, size=8, color=MUTED)
    field(vc.paragraphs[0], f)
widths(t, [3.4, 5.1, 3.4, 5.1])

# ---------- 2. Beneficiários ----------
section_title('02', 'Novos beneficiários')
bt = doc.add_table(rows=4, cols=2)
borders(bt)
hc = bt.rows[0].cells
for c, h in zip(hc, ['#', 'Beneficiário — parentesco — participação']):
    cell_pad(c); shade(c, 'F4F6F5'); run(c.paragraphs[0], h.upper(), bold=True, size=7.5, color=MUTED)
for i in range(1, 4):
    a, b = bt.rows[i].cells
    cell_pad(a); cell_pad(b)
    run(a.paragraphs[0], str(i), bold=True, color=GREEN)
    field(b.paragraphs[0], f'Benef{i}', bold=False)
widths(bt, [1.2, 15.8])
p = para(before=4, after=2)
run(p, 'Os percentuais somam 100%. Linhas sem indicação não produzem efeito. '
       'Menor de idade indicado? ', size=8.5, color=MUTED)
field(p, 'TemMenor', bold=True, size=8.5)

# ---------- 3. Condições ----------
section_title('03', 'Condições')
clause('Seguro de vida — pagamento do capital segurado',
       'O capital segurado será pago aos beneficiários acima, na proporção indicada. Nos termos do art. 794 do '
       'Código Civil, o capital estipulado no seguro de vida não se sujeita às dívidas do segurado nem se '
       'considera herança para todos os efeitos de direito.', 'Produto = Vida')
clause('Plano de previdência — saldo acumulado',
       'Em caso de falecimento do participante durante o período de diferimento, o saldo da provisão matemática '
       'será pago diretamente aos beneficiários acima, na proporção indicada, sem necessidade de inventário, '
       'observado o regime tributário escolhido pelo participante.', 'Produto = Previdência')
clause('Beneficiário menor de idade',
       'O valor devido a beneficiário menor de idade será pago ao seu representante legal, mediante comprovação '
       'da representação, ou depositado em conta judicial em nome do menor, conforme determinação legal.',
       'TemMenor = Sim')
para(before=6)
for i, d in enumerate([
    'Na falta de beneficiários válidos, o pagamento seguirá a ordem legal (art. 792 do Código Civil).',
    'Esta indicação substitui integralmente as anteriores e passa a valer a partir da assinatura.',
    'Os dados pessoais dos beneficiários serão tratados exclusivamente para a gestão do plano, nos termos da '
    'Lei nº 13.709/2018 (LGPD).',
], 1):
    p = para(after=3)
    p.paragraph_format.left_indent = Cm(0.6); p.paragraph_format.first_line_indent = Cm(-0.6)
    run(p, f'{i}.  ', bold=True, size=8.5, color=GREEN); run(p, d, size=8.5, color=MUTED)

# ---------- Assinatura ----------
para(before=26)
sig = doc.add_table(rows=1, cols=2)
borders(sig, inside=False, outer=False)
a, b = sig.rows[0].cells
pa = a.paragraphs[0]
pPr = pa._p.get_or_add_pPr(); pb = OxmlElement('w:pBdr'); top = OxmlElement('w:top')
top.set(qn('w:val'), 'single'); top.set(qn('w:sz'), '6'); top.set(qn('w:color'), '1E2D25'); pb.append(top); pPr.append(pb)
field(pa, 'NomeSegurado', size=9)
pa = a.add_paragraph(); run(pa, 'Segurado(a) / participante', size=8, color=MUTED)
pb2 = b.paragraphs[0]
run(pb2, 'Fontara Seguros S.A.', italic=True, size=13, color=GREEN)
pb2 = b.add_paragraph(); run(pb2, 'Recebido eletronicamente', size=8, color=MUTED)
widths(sig, [8.5, 8.5])

footer = sec.footer.paragraphs[0]
footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
run(footer, 'Fontara Seguros S.A. · CNPJ 00.000.000/0001-00 · Av. Paulista, 1000, São Paulo/SP · '
            'Central 0800 000 0000 · Documento demonstrativo, sem valor comercial', size=7, color=MUTED)

# Ordem dos filhos de tblPr/tcPr/pPr conforme o schema OOXML (Word e LibreOffice toleram fora de
# ordem; conversores mais estritos, não).
ORDER = {
    'tblPr': ['tblStyle', 'tblpPr', 'tblOverlap', 'bidiVisual', 'tblStyleRowBandSize', 'tblStyleColBandSize', 'tblW', 'jc',
              'tblCellSpacing', 'tblInd', 'tblBorders', 'shd', 'tblLayout', 'tblCellMar', 'tblLook'],
    'tcPr': ['cnfStyle', 'tcW', 'gridSpan', 'hMerge', 'vMerge', 'tcBorders', 'shd', 'noWrap', 'tcMar', 'textDirection',
             'tcFitText', 'vAlign', 'hideMark'],
    'pPr': ['pStyle', 'keepNext', 'keepLines', 'pageBreakBefore', 'framePr', 'widowControl', 'numPr', 'suppressLineNumbers',
            'pBdr', 'shd', 'tabs', 'suppressAutoHyphens', 'kinsoku', 'wordWrap', 'overflowPunct', 'topLinePunct', 'autoSpaceDE',
            'autoSpaceDN', 'bidi', 'adjustRightInd', 'snapToGrid', 'spacing', 'ind', 'contextualSpacing', 'mirrorIndents',
            'suppressOverlap', 'jc', 'textDirection', 'textAlignment', 'textboxTightWrap', 'outlineLvl', 'divId', 'cnfStyle',
            'rPr', 'sectPr', 'pPrChange'],
}


def reorder(root):
    for tag, order in ORDER.items():
        for el in root.iter(qn(f'w:{tag}')):
            kids = list(el)
            kids.sort(key=lambda k: order.index(k.tag.split('}')[1]) if k.tag.split('}')[1] in order else len(order))
            for k in kids:
                el.remove(k)
            for k in kids:
                el.append(k)


reorder(doc.element.body)
for s_ in doc.sections:
    reorder(s_.footer._element)
doc.save(OUT)
print('ok ->', OUT)
