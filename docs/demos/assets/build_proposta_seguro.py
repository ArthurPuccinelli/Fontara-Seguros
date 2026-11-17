"""Gera doc-gen/Proposta_Seguro_Fontara.docx: modelo Doc Gen da cotação do site (H1).

Campos de remetente no formato {{Campo}} (cada um num único run, para o DocuSign detectar).
Âncoras de assinatura em texto branco de 1pt: /assinatura_proponente/ e /data_proponente/.
Uso: pip install python-docx && python build_proposta_seguro.py
"""
import os

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'doc-gen', 'Proposta_Seguro_Fontara.docx')
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


# ---------- Cabeçalho ----------
head = doc.add_table(rows=1, cols=2)
borders(head, inside=False, outer=False)
lc, rc = head.rows[0].cells
lc.paragraphs[0].add_run().add_picture(LOGO, width=Cm(4.6))
lc.vertical_alignment = rc.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
p = rc.paragraphs[0]; p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
run(p, 'PROPOSTA DE SEGURO', bold=True, size=13)
p = rc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
run(p, 'Nº ', size=9, color=MUTED); run(p, '{{NumeroProposta}}', bold=True, size=9)
p = rc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
run(p, 'Emitida em ', size=8, color=MUTED); run(p, '{{DataEmissao}}', size=8)
run(p, '  ·  válida até ', size=8, color=MUTED); run(p, '{{ValidadeProposta}}', size=8)
widths(head, [8.5, 8.5])
rule(after=6)

p = para(after=2)
run(p, 'Prezado(a) ', size=10); run(p, '{{NomeProponente}}', bold=True, size=10); run(p, ',', size=10)
para('Esta é a proposta do seu seguro, elaborada a partir da cotação solicitada no site da Fontara Seguros. '
     'Revise os dados e as coberturas abaixo e, estando de acordo, assine eletronicamente ao final.',
     size=9.5, color=MUTED, after=2)

# ---------- 1. Proponente ----------
section_title('01', 'Dados do proponente')
kv_table([
    [('Nome completo', '{{NomeProponente}}'), ('CPF', '{{CpfProponente}}')],
    [('E-mail', '{{EmailProponente}}'), ('Celular', '{{CelularProponente}}')],
])

# ---------- 2. Produto ----------
section_title('02', 'Produto contratado')
t = doc.add_table(rows=1, cols=1)
borders(t, inside=False, outer=False)
c = t.rows[0].cells[0]; shade(c, FILL_SOFT); cell_pad(c, 140, 140, 180, 180)
p = c.paragraphs[0]; run(p, '{{Produto}}', bold=True, size=12)
p = c.add_paragraph(); run(p, '{{DescricaoProduto}}', size=9, color=MUTED)
p = c.add_paragraph(); p.paragraph_format.space_before = Pt(4)
run(p, 'Vigência: ', size=8.5, color=MUTED); run(p, '{{Vigencia}}', bold=True, size=8.5)
run(p, '     Capital de referência: ', size=8.5, color=MUTED); run(p, '{{CapitalReferencia}}', bold=True, size=8.5)

# ---------- 3. Coberturas ----------
section_title('03', 'Coberturas')
cov = doc.add_table(rows=5, cols=3)
borders(cov)
for j, h in enumerate(['Cobertura', 'Capital segurado / limite', 'Franquia / carência']):
    hc = cov.rows[0].cells[j]; cell_pad(hc); shade(hc, 'F4F6F5')
    run(hc.paragraphs[0], h.upper(), bold=True, size=7.5, color=MUTED)
for i in range(1, 5):
    vals = [f'{{{{Cob{i}Nome}}}}', f'{{{{Cob{i}Capital}}}}', f'{{{{Cob{i}Franquia}}}}']
    for j, v in enumerate(vals):
        cc = cov.rows[i].cells[j]; cell_pad(cc)
        run(cc.paragraphs[0], v, bold=(j == 0))
        if j == 1:
            cc.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
for r in cov.rows:
    r.cells[1].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.RIGHT
widths(cov, [8.2, 4.6, 4.2])

# ---------- 4. Prêmio ----------
section_title('04', 'Prêmio e forma de pagamento')
pr = doc.add_table(rows=4, cols=2)
borders(pr)
linhas = [('Prêmio líquido anual', '{{PremioLiquido}}'), ('IOF (7,38%)', '{{Iof}}'),
          ('Prêmio total anual', '{{PremioTotal}}'), ('Forma de pagamento', '{{FormaPagamento}}')]
for i, (k, v) in enumerate(linhas):
    kc, vc = pr.rows[i].cells
    cell_pad(kc); cell_pad(vc)
    run(kc.paragraphs[0], k, size=9, color=MUTED if i != 2 else INK, bold=(i == 2))
    vp = vc.paragraphs[0]; vp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run(vp, v, bold=True, size=11 if i == 2 else 9.5, color=GREEN if i == 2 else INK)
    if i == 2:
        shade(kc, FILL_SOFT); shade(vc, FILL_SOFT)
widths(pr, [11, 6])

# ---------- 5. Observações ----------
section_title('05', 'Observações do proponente')
para('{{Observacoes}}', size=9, color=INK, after=2)

# ---------- 6. Declarações ----------
section_title('06', 'Declarações')
decl = [
    'Declaro que as informações prestadas nesta proposta são verdadeiras e completas, ciente de que omissões '
    'ou inexatidões podem implicar a perda do direito à indenização (art. 766 do Código Civil).',
    'Tenho conhecimento das Condições Gerais e Especiais do produto, disponíveis em fontaraseguros.netlify.app, '
    'e de que a aceitação do risco será comunicada em até 15 dias contados do protocolo desta proposta.',
    'Autorizo o tratamento dos meus dados pessoais pela Fontara Seguros para análise, contratação e gestão do '
    'seguro, nos termos da Lei nº 13.709/2018 (LGPD) e da Política de Privacidade da seguradora.',
    'Posso desistir da contratação em até 7 dias da assinatura, com devolução integral dos valores pagos.',
]
for i, d in enumerate(decl, 1):
    p = para(after=3)
    p.paragraph_format.left_indent = Cm(0.6); p.paragraph_format.first_line_indent = Cm(-0.6)
    run(p, f'{i}.  ', bold=True, size=8.5, color=GREEN); run(p, d, size=8.5, color=MUTED)

# ---------- Assinaturas ----------
para(before=4)
sig = doc.add_table(rows=1, cols=2)
borders(sig, inside=False, outer=False)
a, b = sig.rows[0].cells
pa = a.paragraphs[0]; pa.paragraph_format.space_before = Pt(16)
anc = run(pa, '/assinatura_proponente/', size=1, color=WHITE)
pa = a.add_paragraph(); pa.paragraph_format.space_before = Pt(4)
pPr = pa._p.get_or_add_pPr(); pb = OxmlElement('w:pBdr'); top = OxmlElement('w:top')
top.set(qn('w:val'), 'single'); top.set(qn('w:sz'), '6'); top.set(qn('w:color'), '1E2D25'); pb.append(top); pPr.append(pb)
run(pa, '{{NomeProponente}}', bold=True, size=9)
pa = a.add_paragraph(); run(pa, 'Proponente · assinado em ', size=8, color=MUTED); run(pa, '/data_proponente/', size=8, color=WHITE)

pb2 = b.paragraphs[0]; pb2.paragraph_format.space_before = Pt(8)
run(pb2, 'Fontara Seguros S.A.', italic=True, size=13, color=GREEN)
pb2 = b.add_paragraph(); pb2.paragraph_format.space_before = Pt(4)
pPr = pb2._p.get_or_add_pPr(); pbd = OxmlElement('w:pBdr'); top = OxmlElement('w:top')
top.set(qn('w:val'), 'single'); top.set(qn('w:sz'), '6'); top.set(qn('w:color'), '1E2D25'); pbd.append(top); pPr.append(pbd)
run(pb2, 'Diretoria Comercial', bold=True, size=9)
pb2 = b.add_paragraph(); run(pb2, 'Seguradora', size=8, color=MUTED)
widths(sig, [8.5, 8.5])

# ---------- Rodapé ----------
footer = sec.footer.paragraphs[0]
footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
run(footer, 'Fontara Seguros S.A. · CNPJ 00.000.000/0001-00 · Av. Paulista, 1000, São Paulo/SP · '
            'Central 0800 000 0000 · Ouvidoria 0800 000 0001 · Documento demonstrativo, sem valor comercial',
    size=7, color=MUTED)

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
