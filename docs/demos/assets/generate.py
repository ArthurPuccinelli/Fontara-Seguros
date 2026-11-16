#!/usr/bin/env python3
"""
Gerador dos documentos de demo da Fontara Seguros (todos os dados sao FICTICIOS).

Uso:
    pip install python-docx reportlab
    python generate.py

Saidas (relativas a este arquivo):
    doc-gen/*.docx, doc-gen/*.pdf   -> templates DocuSign Doc Gen ({{Campo}})
    legados/*.pdf, legados/INDEX.md -> contratos legados para extracao por IA (Navigator)

As datas de vencimento dos legados sao calculadas a partir de date.today(),
portanto re-execute o script antes de cada demo para manter os cenarios
"vence em 30/90 dias" coerentes.
"""
import datetime as dt
import os
import re
import unicodedata

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor
from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (BaseDocTemplate, Frame, PageTemplate, Paragraph,
                                Spacer, Table, TableStyle, KeepTogether)

HERE = os.path.dirname(os.path.abspath(__file__))
LOGO = os.path.normpath(os.path.join(HERE, "..", "..", "..", "public", "logo.png"))
OUT_DOCGEN = os.path.join(HERE, "doc-gen")
OUT_LEG = os.path.join(HERE, "legados")
os.makedirs(OUT_DOCGEN, exist_ok=True)
os.makedirs(OUT_LEG, exist_ok=True)

NAVY = "0f2044"
GOLD = "d4a017"
TODAY = dt.date.today()

# --------------------------------------------------------------------------
# CPF / CNPJ (ficticios, com digitos verificadores validos)
# --------------------------------------------------------------------------

def cpf_dv(base9):
    d = [int(c) for c in base9]
    s1 = sum(v * w for v, w in zip(d, range(10, 1, -1))) % 11
    d1 = 0 if s1 < 2 else 11 - s1
    d.append(d1)
    s2 = sum(v * w for v, w in zip(d, range(11, 1, -1))) % 11
    d2 = 0 if s2 < 2 else 11 - s2
    return f"{base9}{d1}{d2}"


def cpf_valid(cpf):
    c = re.sub(r"\D", "", cpf)
    return len(c) == 11 and len(set(c)) > 1 and cpf_dv(c[:9]) == c


def fmt_cpf(base9):
    c = cpf_dv(base9)
    assert cpf_valid(c)
    return f"{c[:3]}.{c[3:6]}.{c[6:9]}-{c[9:]}"


def cnpj_dv(base12):
    d = [int(c) for c in base12]
    w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    s1 = sum(v * w for v, w in zip(d, w1)) % 11
    d1 = 0 if s1 < 2 else 11 - s1
    d.append(d1)
    w2 = [6] + w1
    s2 = sum(v * w for v, w in zip(d, w2)) % 11
    d2 = 0 if s2 < 2 else 11 - s2
    return f"{base12}{d1}{d2}"


def cnpj_valid(cnpj):
    c = re.sub(r"\D", "", cnpj)
    return len(c) == 14 and len(set(c)) > 1 and cnpj_dv(c[:12]) == c


def fmt_cnpj(base8, filial="0001"):
    c = cnpj_dv(base8 + filial)
    assert cnpj_valid(c)
    return f"{c[:2]}.{c[2:5]}.{c[5:8]}/{c[8:12]}-{c[12:]}"


FONTARA_CNPJ = fmt_cnpj("40871235")

# --------------------------------------------------------------------------
# Utilidades de formatacao
# --------------------------------------------------------------------------
MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho",
         "agosto", "setembro", "outubro", "novembro", "dezembro"]


def d_br(d):
    return d.strftime("%d/%m/%Y")


def d_ext(d):
    return f"{d.day}{'º' if d.day == 1 else ''} de {MESES[d.month - 1]} de {d.year}"


def brl(v):
    s = f"{v:,.2f}"
    return "R$ " + s.replace(",", "X").replace(".", ",").replace("X", ".")


def add_years(d, n):
    try:
        return d.replace(year=d.year + n)
    except ValueError:  # 29/02
        return d.replace(year=d.year + n, day=28)


def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = re.sub(r"[^A-Za-z0-9]+", "_", s).strip("_")
    return s


# ==========================================================================
# A) DOC GEN WORD TEMPLATES
# ==========================================================================

def set_cell_bg(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:val"), "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"), hex_color)
    tcPr.append(shd)


def set_cell_borders(cell, color="BFC5D2", sz="4"):
    tcPr = cell._tc.get_or_add_tcPr()
    borders = OxmlElement("w:tcBorders")
    for edge in ("top", "left", "bottom", "right"):
        el = OxmlElement(f"w:{edge}")
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), sz)
        el.set(qn("w:color"), color)
        borders.append(el)
    tcPr.append(borders)


def para_bottom_border(p, color=GOLD, sz="12"):
    pPr = p._p.get_or_add_pPr()
    pb = OxmlElement("w:pBdr")
    b = OxmlElement("w:bottom")
    b.set(qn("w:val"), "single")
    b.set(qn("w:sz"), sz)
    b.set(qn("w:space"), "1")
    b.set(qn("w:color"), color)
    pb.append(b)
    pPr.append(pb)


def new_doc(subtitle):
    doc = Document()
    sec = doc.sections[0]
    sec.page_width, sec.page_height = Cm(21), Cm(29.7)
    sec.left_margin = sec.right_margin = Cm(2)
    sec.top_margin, sec.bottom_margin = Cm(2.6), Cm(2)
    st = doc.styles["Normal"]
    st.font.name = "Calibri"
    st.element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")
    st.font.size = Pt(10)
    st.paragraph_format.space_after = Pt(4)

    hdr = sec.header
    t = hdr.add_table(1, 2, Cm(17))
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    c0, c1 = t.rows[0].cells
    c0.width, c1.width = Cm(7), Cm(10)
    p = c0.paragraphs[0]
    p.add_run().add_picture(LOGO, height=Cm(1.3))
    p = c1.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p.add_run("Fontara Seguros S.A.\n")
    r.bold = True
    r.font.size = Pt(9)
    r.font.color.rgb = RGBColor.from_string(NAVY)
    r = p.add_run(f"CNPJ {FONTARA_CNPJ}  |  Seguros de Pessoas e Previdência\n{subtitle}")
    r.font.size = Pt(8)
    r.font.color.rgb = RGBColor(0x55, 0x5B, 0x6B)
    hp = hdr.add_paragraph()
    para_bottom_border(hp)
    hp.paragraph_format.space_after = Pt(0)

    fp = sec.footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = fp.add_run("Documento fictício para demonstração. Fontara Seguros S.A. - Processo SUSEP fictício nº 15414.900000/2016-00.")
    r.font.size = Pt(7)
    r.font.color.rgb = RGBColor(0x77, 0x77, 0x77)
    return doc


def d_title(doc, title, sub=None):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(6)
    r = p.add_run(title)
    r.bold = True
    r.font.size = Pt(15)
    r.font.color.rgb = RGBColor.from_string(NAVY)
    if sub:
        p2 = doc.add_paragraph()
        p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p2.add_run(sub)
        r.font.size = Pt(9)
        r.italic = True


def d_heading(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text.upper())
    r.bold = True
    r.font.size = Pt(10.5)
    r.font.color.rgb = RGBColor.from_string(NAVY)
    para_bottom_border(p, GOLD, "8")


def d_text(doc, text, size=9.5, italic=False, bold=False):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    r = p.add_run(text)
    r.font.size = Pt(size)
    r.italic = italic
    r.bold = bold
    return p


def d_grid(doc, rows, cols=2):
    """rows: lista de (label, valor). cols = pares label/valor por linha."""
    n = (len(rows) + cols - 1) // cols
    t = doc.add_table(n, cols * 2)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    total = 17.0
    lw = 3.3 if cols == 2 else 4.2
    vw = (total - lw * cols) / cols
    for i, (lab, val) in enumerate(rows):
        row, col = divmod(i, cols)
        cl, cv = t.cell(row, col * 2), t.cell(row, col * 2 + 1)
        cl.width, cv.width = Cm(lw), Cm(vw)
        set_cell_bg(cl, "EEF1F7")
        for c in (cl, cv):
            set_cell_borders(c)
        pl = cl.paragraphs[0]
        rl = pl.add_run(lab)
        rl.bold = True
        rl.font.size = Pt(8.5)
        rl.font.color.rgb = RGBColor.from_string(NAVY)
        rv = cv.paragraphs[0].add_run(val)
        rv.font.size = Pt(9.5)
    # linha final incompleta: preenche vazio
    return t


def d_table(doc, header, rows, widths):
    t = doc.add_table(1 + len(rows), len(header))
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    for j, h in enumerate(header):
        c = t.cell(0, j)
        c.width = Cm(widths[j])
        set_cell_bg(c, NAVY)
        set_cell_borders(c, NAVY)
        r = c.paragraphs[0].add_run(h)
        r.bold = True
        r.font.size = Pt(9)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    for i, row in enumerate(rows, start=1):
        for j, v in enumerate(row):
            c = t.cell(i, j)
            c.width = Cm(widths[j])
            set_cell_borders(c)
            if i % 2 == 0:
                set_cell_bg(c, "F6F8FC")
            r = c.paragraphs[0].add_run(v)
            r.font.size = Pt(9.5)
    return t


def d_sign_block(doc, who, anchors, name_ph=None):
    """Bloco de assinatura: linha + ancoras brancas (FFFFFF, 6pt)."""
    t = doc.add_table(1, 2)
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    a, b = t.rows[0].cells
    a.width, b.width = Cm(11), Cm(6)
    p = a.paragraphs[0]
    p.paragraph_format.space_before = Pt(22)
    p.add_run("_" * 52).font.size = Pt(9)
    anc = anchors[0]
    r = p.add_run(anc)
    r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
    r.font.size = Pt(6)
    p2 = a.add_paragraph()
    r = p2.add_run(who)
    r.bold = True
    r.font.size = Pt(9.5)
    if name_ph:
        r = p2.add_run("  -  " + name_ph)
        r.font.size = Pt(9.5)
    p3 = b.paragraphs[0]
    p3.paragraph_format.space_before = Pt(22)
    p3.add_run("_" * 24).font.size = Pt(9)
    if len(anchors) > 1:
        r = p3.add_run(anchors[1])
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
        r.font.size = Pt(6)
    p4 = b.add_paragraph()
    r = p4.add_run("Data")
    r.font.size = Pt(9)
    r.bold = True
    doc.add_paragraph()


def build_pf():
    doc = new_doc("Proposta de Adesão PF")
    d_title(doc, "Proposta de Adesão",
            "Previdência Privada / Seguro de Vida Individual")
    d_grid(doc, [("Nº da Proposta", "{{NumeroProposta}}"),
                 ("Data da Proposta", "{{DataProposta}}")])
    d_heading(doc, "1. Dados do Proponente")
    d_grid(doc, [("Nome completo", "{{NomeTitular}}"),
                 ("CPF", "{{CpfTitular}}"),
                 ("E-mail", "{{EmailTitular}}"),
                 ("Celular", "{{CelularTitular}}"),
                 ("Data de nascimento", "{{DataNascimento}}"),
                 ("Endereço", "{{Endereco}}")])
    d_heading(doc, "2. Plano Contratado")
    d_table(doc, ["Produto", "Contribuição / Prêmio", "Periodicidade"],
            [["{{Produto}}", "{{ValorContribuicao}}", "{{Periodicidade}}"]],
            [8, 5, 4])
    d_text(doc, "")
    d_grid(doc, [("Canal de venda", "{{Canal}}"), ("Corretor", "{{Corretor}}")])
    d_heading(doc, "3. Beneficiários")
    d_text(doc, "{{Beneficiarios}}")
    d_text(doc, "Na ausência de indicação válida, aplica-se a ordem de vocação hereditária prevista no Código Civil.",
           size=8.5, italic=True)
    d_heading(doc, "4. Declarações")
    d_text(doc, "4.1 Declaração de saúde simplificada. O Proponente declara que as informações de saúde prestadas nesta proposta são verdadeiras e completas, "
                "não tendo omitido fato relevante para a avaliação do risco. A omissão ou inexatidão dolosa poderá acarretar a perda do direito ao capital segurado, "
                "nos termos do art. 766 do Código Civil.")
    d_text(doc, "4.2 Ciência do regulamento. O Proponente declara ter recebido, lido e compreendido o regulamento do plano e/ou as condições gerais do seguro, "
                "incluindo regras de carência, resgate, portabilidade, tributação, carregamento e taxa de administração.")
    d_text(doc, "4.3 Consentimento LGPD. O Proponente autoriza a Fontara Seguros S.A. a tratar seus dados pessoais e dados sensíveis de saúde "
                "para as finalidades de análise de risco, emissão, administração e cumprimento de obrigações legais e regulatórias, "
                "conforme a Lei nº 13.709/2018 e a Política de Privacidade disponível no portal da seguradora.")
    d_heading(doc, "5. Assinaturas")
    d_text(doc, "Local e data: conforme registro de assinatura eletrônica.", size=9)
    d_sign_block(doc, "Proponente", ["/assinatura_titular/", "/data_titular/"], "{{NomeTitular}}")
    doc.save(os.path.join(OUT_DOCGEN, "Proposta_Adesao_PF.docx"))


def build_pj():
    doc = new_doc("Proposta de Adesão PJ")
    d_title(doc, "Proposta de Adesão",
            "Plano Empresarial (Vida em Grupo / Previdência PJ)")
    d_grid(doc, [("Nº da Proposta", "{{NumeroProposta}}"),
                 ("Data da Proposta", "{{DataProposta}}")])
    d_heading(doc, "1. Dados da Estipulante")
    d_grid(doc, [("Razão social", "{{RazaoSocial}}"), ("CNPJ", "{{Cnpj}}")])
    d_heading(doc, "2. Representantes Legais")
    d_table(doc, ["Representante", "Nome", "CPF", "Cargo"],
            [["Representante 1", "{{Rep1Nome}}", "{{Rep1Cpf}}", "{{Rep1Cargo}}"],
             ["Representante 2", "{{Rep2Nome}}", "{{Rep2Cpf}}", "{{Rep2Cargo}}"],
             ["Representante 3", "{{Rep3Nome}}", "{{Rep3Cpf}}", "{{Rep3Cargo}}"]],
            [3.2, 6, 3.6, 4.2])
    d_heading(doc, "3. Plano")
    d_table(doc, ["Produto", "Contribuição / Prêmio", "Periodicidade"],
            [["{{Produto}}", "{{ValorContribuicao}}", "{{Periodicidade}}"]], [8, 5, 4])
    d_text(doc, "")
    d_grid(doc, [("Canal de venda", "{{Canal}}")])
    d_heading(doc, "4. Condições")
    d_text(doc, "4.1 A Estipulante declara que o grupo segurado/participante é composto por empregados e/ou administradores vinculados, "
                "observados os critérios de elegibilidade do regulamento ou das condições gerais.")
    d_text(doc, "4.2 A Estipulante é responsável pelo repasse tempestivo das contribuições/prêmios e pela atualização cadastral do grupo, "
                "assumindo as obrigações previstas na regulamentação da SUSEP e do CNSP.")
    d_text(doc, "4.3 Os representantes legais abaixo assinam em conformidade com o contrato/estatuto social vigente, "
                "declarando possuir poderes para obrigar a Estipulante, e autorizam o tratamento de dados pessoais nos termos da LGPD.")
    d_text(doc, "4.4 Esta proposta somente produzirá efeitos após a aceitação pela Fontara Seguros S.A., no prazo de até 15 dias.")
    d_heading(doc, "5. Assinaturas")
    d_text(doc, "Representantes legais da Estipulante", bold=True, size=9.5)
    d_sign_block(doc, "Representante 1", ["/assinatura_rep1/"], "{{Rep1Nome}}")
    d_sign_block(doc, "Representante 2", ["/assinatura_rep2/"], "{{Rep2Nome}}")
    d_sign_block(doc, "Representante 3", ["/assinatura_rep3/"], "{{Rep3Nome}}")
    d_text(doc, "Testemunhas", bold=True, size=9.5)
    d_sign_block(doc, "Testemunha 1", ["/assinatura_test1/"], "{{Test1Nome}}")
    d_sign_block(doc, "Testemunha 2", ["/assinatura_test2/"], "{{Test2Nome}}")
    doc.save(os.path.join(OUT_DOCGEN, "Proposta_Adesao_PJ.docx"))


RESGATE_FIELDS = [
    ("Titular", [("Nome do titular", "{{NomeTitular}}"), ("CPF", "{{CpfTitular}}"),
                 ("Nº do certificado", "{{NumeroCertificado}}"),
                 ("Data da solicitação", "{{DataSolicitacao}}")]),
    ("Solicitação", [("Tipo de solicitação", "{{TipoSolicitacao}}"),
                     ("Valor solicitado", "{{ValorResgate}}")]),
    ("Portabilidade - Entidade de destino", [("Entidade de destino", "{{EntidadeDestino}}"),
                                             ("CNPJ da entidade", "{{CnpjEntidadeDestino}}")]),
    ("Resgate - Dados bancários para crédito", [("Banco", "{{Banco}}"), ("Agência", "{{Agencia}}"),
                                                 ("Conta", "{{Conta}}")]),
]
RESGATE_DECL = [
    "Declaro que as informações acima são verdadeiras e que sou o titular do certificado indicado.",
    "Estou ciente de que o resgate e a portabilidade observam os prazos de carência e as regras do regulamento do plano, "
    "e de que o pagamento ocorrerá em até 10 (dez) dias úteis após o recebimento da documentação completa.",
    "Estou ciente da tributação aplicável (Imposto de Renda conforme regime tributário escolhido - progressivo ou regressivo) "
    "e de que, na portabilidade, os recursos serão transferidos diretamente à entidade de destino, sem tributação na origem.",
    "Autorizo o tratamento dos meus dados pessoais para a finalidade desta solicitação, conforme a LGPD (Lei nº 13.709/2018).",
]


def build_resgate_docx():
    doc = new_doc("Solicitação de Resgate / Portabilidade")
    d_title(doc, "Solicitação de Resgate / Portabilidade",
            "Previdência Privada - PGBL / VGBL")
    for i, (sec, rows) in enumerate(RESGATE_FIELDS, start=1):
        d_heading(doc, f"{i}. {sec}")
        d_grid(doc, rows, cols=2 if len(rows) != 3 else 3)
    d_heading(doc, "5. Declarações")
    for t in RESGATE_DECL:
        d_text(doc, "- " + t)
    d_heading(doc, "6. Assinatura")
    d_sign_block(doc, "Titular", ["/assinatura_titular/"], "{{NomeTitular}}")
    doc.save(os.path.join(OUT_DOCGEN, "Solicitacao_Resgate_Portabilidade.docx"))


# ---------------------------- PDF helpers ---------------------------------
_ss = getSampleStyleSheet()
ST_BODY = ParagraphStyle("body", parent=_ss["Normal"], fontName="Helvetica", fontSize=9, leading=12.2,
                         alignment=TA_JUSTIFY, spaceAfter=4)
ST_H = ParagraphStyle("h", parent=_ss["Normal"], fontName="Helvetica-Bold", fontSize=9.5, leading=12,
                      textColor=colors.HexColor("#" + NAVY), spaceBefore=8, spaceAfter=3)
ST_T = ParagraphStyle("t", parent=_ss["Normal"], fontName="Helvetica-Bold", fontSize=14, leading=18,
                      textColor=colors.HexColor("#" + NAVY), alignment=1, spaceAfter=2)
ST_SUB = ParagraphStyle("s", parent=_ss["Normal"], fontName="Helvetica-Oblique", fontSize=8.5, alignment=1,
                        spaceAfter=6)
ST_CELL = ParagraphStyle("c", parent=_ss["Normal"], fontName="Helvetica", fontSize=8.8, leading=11)
ST_CELLB = ParagraphStyle("cb", parent=ST_CELL, fontName="Helvetica-Bold", textColor=colors.HexColor("#" + NAVY))


def pdf_page(canvas, doc_, subtitle):
    canvas.saveState()
    w, h = A4
    img_h = 1.15 * cm
    canvas.drawImage(LOGO, 2 * cm, h - 2.0 * cm, width=img_h * 1997 / 690, height=img_h, mask="auto")
    canvas.setFont("Helvetica-Bold", 8.5)
    canvas.setFillColor(colors.HexColor("#" + NAVY))
    canvas.drawRightString(w - 2 * cm, h - 1.25 * cm, "Fontara Seguros S.A.")
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(colors.HexColor("#555B6B"))
    canvas.drawRightString(w - 2 * cm, h - 1.65 * cm, f"CNPJ {FONTARA_CNPJ}  |  {subtitle}")
    canvas.setStrokeColor(colors.HexColor("#" + GOLD))
    canvas.setLineWidth(1.4)
    canvas.line(2 * cm, h - 2.25 * cm, w - 2 * cm, h - 2.25 * cm)
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(colors.HexColor("#777777"))
    canvas.drawString(2 * cm, 1.1 * cm, "Documento fictício para demonstração - Fontara Seguros S.A.")
    canvas.drawRightString(w - 2 * cm, 1.1 * cm, f"Página {canvas.getPageNumber()}")
    canvas.restoreState()


def make_pdf(path, subtitle, story):
    doc = BaseDocTemplate(path, pagesize=A4, leftMargin=2 * cm, rightMargin=2 * cm,
                          topMargin=2.7 * cm, bottomMargin=1.8 * cm,
                          title=subtitle, author="Fontara Seguros S.A. (demo)")
    fr = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="f")
    doc.addPageTemplates([PageTemplate(id="p", frames=[fr],
                                       onPage=lambda c, d: pdf_page(c, d, subtitle))])
    doc.build(story)


def pdf_kv_table(rows, cols=2):
    data, row = [], []
    for lab, val in rows:
        row += [Paragraph(lab, ST_CELLB), Paragraph(val, ST_CELL)]
        if len(row) == cols * 2:
            data.append(row)
            row = []
    if row:
        row += [""] * (cols * 2 - len(row))
        data.append(row)
    lw = {1: 4.6, 2: 3.0, 3: 2.6}[cols] * cm
    vw = (17 * cm - lw * cols) / cols
    t = Table(data, colWidths=[lw, vw] * cols)
    t.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#BFC5D2")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ] + [("BACKGROUND", (c * 2, 0), (c * 2, -1), colors.HexColor("#EEF1F7")) for c in range(cols)]))
    return t


def build_resgate_pdf(esign=False):
    """esign=True: placeholders em branco/6pt para servirem de âncora (anchorString) de campos eSignature/Web Forms."""
    def ph(v):
        if not esign:
            return v
        return re.sub(r"(\{\{\w+\}\})", r'<font color="#FFFFFF" size="6">\1</font>', v)
    story = [Paragraph("Solicitação de Resgate / Portabilidade", ST_T),
             Paragraph("Previdência Privada - PGBL / VGBL", ST_SUB)]
    for i, (sec, rows) in enumerate(RESGATE_FIELDS, start=1):
        story.append(Paragraph(f"{i}. {sec.upper()}", ST_H))
        rows = [(lab, ph(val)) for lab, val in rows]
        story.append(pdf_kv_table(rows, cols=2 if len(rows) != 3 else 3))
    story.append(Paragraph("5. DECLARAÇÕES", ST_H))
    for t in RESGATE_DECL:
        story.append(Paragraph("- " + t, ST_BODY))
    story.append(Paragraph("6. ASSINATURA", ST_H))
    story.append(Spacer(1, 22))
    sig = Table([[Paragraph('_' * 48 + '<font color="#FFFFFF" size="6">/assinatura_titular/</font>', ST_CELL)],
                 [Paragraph("<b>Titular</b>" + ("" if esign else "  -  {{NomeTitular}}"), ST_CELL)]], colWidths=[17 * cm])
    story.append(KeepTogether(sig))
    name = "Solicitacao_Resgate_Portabilidade_esign.pdf" if esign else "Solicitacao_Resgate_Portabilidade.pdf"
    make_pdf(os.path.join(OUT_DOCGEN, name),
             "Solicitação de Resgate / Portabilidade", story)


PROPOSTA_DECL_PF = [
    "4.1 Declaração de saúde simplificada. O Proponente declara que as informações de saúde prestadas nesta proposta são verdadeiras e completas, "
    "não tendo omitido fato relevante para a avaliação do risco. A omissão ou inexatidão dolosa poderá acarretar a perda do direito ao capital segurado, "
    "nos termos do art. 766 do Código Civil.",
    "4.2 Ciência do regulamento. O Proponente declara ter recebido, lido e compreendido o regulamento do plano e/ou as condições gerais do seguro, "
    "incluindo regras de carência, resgate, portabilidade, tributação, carregamento e taxa de administração.",
    "4.3 Consentimento LGPD. O Proponente autoriza a Fontara Seguros S.A. a tratar seus dados pessoais e dados sensíveis de saúde "
    "para as finalidades de análise de risco, emissão, administração e cumprimento de obrigações legais e regulatórias, "
    "conforme a Lei nº 13.709/2018 e a Política de Privacidade disponível no portal da seguradora.",
]
PROPOSTA_DECL_PJ = [
    "4.1 A Estipulante declara que o grupo segurado/participante é composto por empregados e/ou administradores vinculados, "
    "observados os critérios de elegibilidade do regulamento ou das condições gerais.",
    "4.2 A Estipulante é responsável pelo repasse tempestivo das contribuições/prêmios e pela atualização cadastral do grupo, "
    "assumindo as obrigações previstas na regulamentação da SUSEP e do CNSP.",
    "4.3 Os representantes legais abaixo assinam em conformidade com o contrato/estatuto social vigente, "
    "declarando possuir poderes para obrigar a Estipulante, e autorizam o tratamento de dados pessoais nos termos da LGPD.",
    "4.4 Esta proposta somente produzirá efeitos após a aceitação pela Fontara Seguros S.A., no prazo de até 15 dias.",
]


def build_proposta_pdf(kind):
    """Proposta de Adesão PF/PJ em PDF para eSignature: {{Campo}} e ancoras de assinatura em branco/6pt."""
    def ph(v):
        return re.sub(r"(\{\{\w+\}\})", r'<font color="#FFFFFF" size="6">\1</font>', v)

    def anc(a):
        return f'<font color="#FFFFFF" size="6">{a}</font>'

    def grid(t, header, rows, widths):
        data = [[Paragraph(h, ST_CELLB) for h in header]] + \
               [[Paragraph(ph(c), ST_CELL) for c in r] for r in rows]
        tb = Table(data, colWidths=[w * cm for w in widths])
        tb.setStyle(TableStyle([
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#BFC5D2")),
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EEF1F7")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        return tb

    def sign(who, name_ph, a1, a2=None):
        left = Paragraph("_" * 40 + anc(a1), ST_CELL)
        left2 = Paragraph(f"<b>{who}</b>" + (f"  -  {ph(name_ph)}" if name_ph else ""), ST_CELL)
        if a2:
            right = Paragraph("_" * 24 + anc(a2), ST_CELL)
            right2 = Paragraph("<b>Data</b>", ST_CELL)
            tb = Table([[left, right], [left2, right2]], colWidths=[11 * cm, 6 * cm])
        else:
            tb = Table([[left], [left2]], colWidths=[17 * cm])
        tb.setStyle(TableStyle([("TOPPADDING", (0, 0), (-1, 0), 18)]))
        return KeepTogether([tb, Spacer(1, 6)])

    def kv(rows, cols=2):
        return pdf_kv_table([(lab, ph(val)) for lab, val in rows], cols=cols)

    story = [Paragraph("Proposta de Adesão", ST_T)]
    if kind == "PF":
        story.append(Paragraph("Previdência Privada / Seguro de Vida Individual", ST_SUB))
        story.append(kv([("Nº da Proposta", "{{NumeroProposta}}"), ("Data da Proposta", "{{DataProposta}}")]))
        story.append(Paragraph("1. DADOS DO PROPONENTE", ST_H))
        story.append(kv([("Nome completo", "{{NomeTitular}}"), ("CPF", "{{CpfTitular}}"),
                         ("E-mail", "{{EmailTitular}}"), ("Celular", "{{CelularTitular}}"),
                         ("Data de nascimento", "{{DataNascimento}}"), ("Endereço", "{{Endereco}}")]))
        story.append(Paragraph("2. PLANO CONTRATADO", ST_H))
        story.append(grid(None, ["Produto", "Contribuição / Prêmio", "Periodicidade"],
                          [["{{Produto}}", "{{ValorContribuicao}}", "{{Periodicidade}}"]], [8, 5, 4]))
        story.append(Spacer(1, 6))
        story.append(kv([("Canal de venda", "{{Canal}}"), ("Corretor", "{{Corretor}}")]))
        story.append(Paragraph("3. BENEFICIÁRIOS", ST_H))
        story.append(Paragraph(ph("{{Beneficiarios}}"), ST_BODY))
        story.append(Paragraph("<i>Na ausência de indicação válida, aplica-se a ordem de vocação hereditária prevista no Código Civil.</i>", ST_BODY))
        story.append(Paragraph("4. DECLARAÇÕES", ST_H))
        for t in PROPOSTA_DECL_PF:
            story.append(Paragraph(t, ST_BODY))
        story.append(Paragraph("5. ASSINATURAS", ST_H))
        story.append(Paragraph("Local e data: conforme registro de assinatura eletrônica.", ST_BODY))
        story.append(sign("Proponente", None, "/assinatura_titular/", "/data_titular/"))
        sub = "Proposta de Adesão PF"
    else:
        story.append(Paragraph("Plano Empresarial (Vida em Grupo / Previdência PJ)", ST_SUB))
        story.append(kv([("Nº da Proposta", "{{NumeroProposta}}"), ("Data da Proposta", "{{DataProposta}}")]))
        story.append(Paragraph("1. DADOS DA ESTIPULANTE", ST_H))
        story.append(kv([("Razão social", "{{RazaoSocial}}"), ("CNPJ", "{{Cnpj}}")]))
        story.append(Paragraph("2. REPRESENTANTES LEGAIS", ST_H))
        story.append(grid(None, ["Representante", "Nome", "CPF", "Cargo"],
                          [[f"Representante {i}", f"{{{{Rep{i}Nome}}}}", f"{{{{Rep{i}Cpf}}}}", f"{{{{Rep{i}Cargo}}}}"]
                           for i in (1, 2, 3)], [3.2, 6, 3.6, 4.2]))
        story.append(Paragraph("3. PLANO", ST_H))
        story.append(grid(None, ["Produto", "Contribuição / Prêmio", "Periodicidade"],
                          [["{{Produto}}", "{{ValorContribuicao}}", "{{Periodicidade}}"]], [8, 5, 4]))
        story.append(Spacer(1, 6))
        story.append(kv([("Canal de venda", "{{Canal}}")]))
        story.append(Paragraph("4. CONDIÇÕES", ST_H))
        for t in PROPOSTA_DECL_PJ:
            story.append(Paragraph(t, ST_BODY))
        story.append(Paragraph("5. ASSINATURAS", ST_H))
        story.append(Paragraph("<b>Representantes legais da Estipulante</b>", ST_BODY))
        for i in (1, 2, 3):
            story.append(sign(f"Representante {i}", None, f"/assinatura_rep{i}/"))
        story.append(Paragraph("<b>Testemunhas</b>", ST_BODY))
        for i in (1, 2):
            story.append(sign(f"Testemunha {i}", f"{{{{Test{i}Nome}}}}", f"/assinatura_test{i}/"))
        sub = "Proposta de Adesão PJ"
    make_pdf(os.path.join(OUT_DOCGEN, f"Proposta_Adesao_{kind}_esign.pdf"), sub, story)


# ==========================================================================
# B) CONTRATOS LEGADOS
# ==========================================================================
# offset de vencimento em dias a partir de hoje, anos de prazo, etc.
C = []


def add(**kw):
    C.append(kw)


add(key="pgbl1", kind="cert", pj=False, prod_line="PGBL", nome="Helena Marquesa Vasconcelos Demo",
    cpf=fmt_cpf("318274659"), produto="Fontara PGBL Futuro Seguro", end_off=420, years=8,
    renov=True, aviso=60, valor=1850.00, valor_tipo="Contribuição mensal", foro="Comarca de São Paulo/SP",
    seq="0031942", pref="CERT-PGBL")
add(key="vgbl1", kind="cert", pj=False, prod_line="VGBL", nome="Otávio Brandão Linhares Demo",
    cpf=fmt_cpf("527391840"), produto="Fontara VGBL Essencial Renda", end_off=24, years=10,
    renov=False, aviso=0, valor=2400.00, valor_tipo="Contribuição mensal", foro="Comarca de Belo Horizonte/MG",
    seq="0007718", pref="CERT-VGBL")
add(key="vida1", kind="vida", pj=False, nome="Cecília Montenegro Duarte Demo",
    cpf=fmt_cpf("264810937"), produto="Fontara Vida Proteção Total", end_off=9, years=5,
    renov=True, aviso=30, valor=750000.00, valor_tipo="Capital segurado", premio=189.90,
    foro="Comarca de São Paulo/SP", seq="0114520", pref="AP-VI")
add(key="vida2", kind="vida", pj=False, nome="Raimundo Tavares Peixoto Demo",
    cpf=fmt_cpf("873150264"), produto="Fontara Vida Família", end_off=-45, years=5,
    renov=False, aviso=0, valor=300000.00, valor_tipo="Capital segurado", premio=96.40,
    foro="Comarca de Curitiba/PR", seq="0098876", pref="AP-VI")
add(key="pgbl2", kind="cert", pj=False, prod_line="PGBL", nome="Lívia Cavalcanti Rezende Demo",
    cpf=fmt_cpf("405926183"), produto="Fontara PGBL Futuro Seguro", end_off=61, years=8,
    renov=True, aviso=90, valor=3200.00, valor_tipo="Contribuição mensal", foro="Comarca de Porto Alegre/RS",
    seq="0022305", pref="CERT-PGBL")
add(key="vida3", kind="vida", pj=False, nome="Joaquim Esteves Barroso Demo",
    cpf=fmt_cpf("690274518"), produto="Fontara Vida Proteção Total", end_off=300, years=3,
    renov=True, aviso=45, valor=500000.00, valor_tipo="Capital segurado", premio=142.75,
    foro="Comarca do Rio de Janeiro/RJ", seq="0201334", pref="AP-VI")

add(key="vg1", kind="vg", pj=True, nome="Metalúrgica Vale Imaginário Demo Ltda", cnpj=fmt_cnpj("12485937"),
    rep="Rodrigo Almeida Fontenele Demo", rep_cpf=fmt_cpf("158493720"), rep_cargo="Diretor Administrativo",
    produto="Fontara Vida em Grupo Empresa Protegida", end_off=540, years=7, renov=True, aviso=90,
    valor=18450.00, valor_tipo="Prêmio mensal total", vidas=142, cap_mult=24, foro="Comarca de Campinas/SP",
    seq="0004871", pref="AP-VG")
add(key="vg2", kind="vg", pj=True, nome="Construtora Horizonte Azul Demo S.A.", cnpj=fmt_cnpj("30761248"),
    rep="Patrícia Nogueira Salgado Demo", rep_cpf=fmt_cpf("742915306"), rep_cargo="Diretora Financeira",
    produto="Fontara Vida em Grupo Empresa Protegida", end_off=17, years=5, renov=True, aviso=60,
    valor=32980.50, valor_tipo="Prêmio mensal total", vidas=310, cap_mult=36, foro="Comarca de São Paulo/SP",
    seq="0003512", pref="AP-VG")
add(key="vg3", kind="vg", pj=True, nome="Laticínios Serra Encantada Demo Ltda", cnpj=fmt_cnpj("55318076"),
    rep="Anselmo Ribeiro Castanheira Demo", rep_cpf=fmt_cpf("291863405"), rep_cargo="Sócio-Administrador",
    produto="Fontara Vida em Grupo Essencial", end_off=85, years=5, renov=False, aviso=0,
    valor=7620.00, valor_tipo="Prêmio mensal total", vidas=64, cap_mult=12, foro="Comarca de Belo Horizonte/MG",
    seq="0005906", pref="AP-VG")
add(key="pe1", kind="pe", pj=True, nome="Tecnologia Rio Nublado Demo S.A.", cnpj=fmt_cnpj("21947683"),
    rep="Marcela Queiroz Albuquerque Demo", rep_cpf=fmt_cpf("536702918"), rep_cargo="Diretora de Pessoas",
    produto="Fontara Previdência Empresarial Colaborador+", end_off=700, years=10, renov=True, aviso=120,
    valor=46200.00, valor_tipo="Contribuição mensal patrocinadora", vidas=228, foro="Comarca do Rio de Janeiro/RJ",
    seq="0001147", pref="CT-PE")
add(key="pe2", kind="pe", pj=True, nome="Agroindustrial Campos do Sul Demo Ltda", cnpj=fmt_cnpj("08264519"),
    rep="Eduardo Pimentel Guimarães Demo", rep_cpf=fmt_cpf("814059263"), rep_cargo="Diretor-Presidente",
    produto="Fontara Previdência Empresarial Colaborador+", end_off=-120, years=5, renov=False, aviso=0,
    valor=15800.00, valor_tipo="Contribuição mensal patrocinadora", vidas=96, foro="Comarca de Curitiba/PR",
    seq="0000934", pref="CT-PE")
add(key="cp1", kind="parceria", pj=True, nome="Correspondente Praça Nova Demo Serviços Financeiros Ltda",
    cnpj=fmt_cnpj("37620481"), rep="Vanessa Lacerda Bittencourt Demo", rep_cpf=fmt_cpf("603918472"),
    rep_cargo="Diretora Comercial", produto="Programa Canal Parceiro - Distribuição de Seguros de Pessoas e Previdência",
    end_off=29, years=5, renov=True, aviso=90, valor=18500.00, valor_tipo="Fee mensal fixo", comissao=4.5,
    foro="Comarca de Brasília/DF", seq="0000218", pref="CP")
add(key="ad1", kind="aditivo", pj=True, parent="vg1", end_off=540, ad_days_ago=215, renov=True, aviso=90,
    valor=21930.00, valor_tipo="Prêmio mensal total (pós-aditivo)", vidas=168, cap_mult=24, seq="000231", pref="AD")
add(key="ad2", kind="aditivo", pj=True, parent="vg3", end_off=85, ad_days_ago=130, renov=False, aviso=0,
    valor=8940.00, valor_tipo="Prêmio mensal total (pós-aditivo)", vidas=75, cap_mult=12, seq="000302", pref="AD")

BY_KEY = {c["key"]: c for c in C}

TIPO_LABEL = {"cert": "Certificado de Previdência", "vida": "Apólice de Seguro de Vida Individual",
              "vg": "Apólice de Vida em Grupo", "pe": "Contrato de Previdência Empresarial",
              "parceria": "Contrato de Parceria Comercial - Canal Parceiro", "aditivo": "Aditivo Contratual"}

# resolve datas e numeros
for c in C:
    c["end"] = TODAY + dt.timedelta(days=c["end_off"])
    if c["kind"] == "aditivo":
        p = BY_KEY[c["parent"]]
        c["nome"], c["cnpj"] = p["nome"], p["cnpj"]
        c["rep"], c["rep_cpf"], c["rep_cargo"] = p["rep"], p["rep_cpf"], p["rep_cargo"]
        c["foro"], c["produto"] = p["foro"], p["produto"]
        c["start"] = TODAY - dt.timedelta(days=c["ad_days_ago"])
        c["sign"] = c["start"] - dt.timedelta(days=4)
        c["end"] = p["end"]
        c["ano"] = c["start"].year
    else:
        c["start"] = add_years(c["end"], -c["years"])
        c["sign"] = c["start"] - dt.timedelta(days=6)
        c["ano"] = c["start"].year
    c["numero"] = f"{c['pref']}-{c['ano']}-{c['seq']}"
for c in C:
    if c["kind"] == "aditivo":
        c["parent_num"] = BY_KEY[c["parent"]]["numero"]
        c["parent_inicio"] = BY_KEY[c["parent"]]["start"]

for c in C:
    k = c["kind"]
    nm = slug(c["nome"])
    if k == "cert":
        c["file"] = f"Certificado_{c['prod_line']}_{nm}_{c['ano']}.pdf"
    elif k == "vida":
        c["file"] = f"Apolice_VidaIndividual_{nm}_{c['ano']}.pdf"
    elif k == "vg":
        c["file"] = f"Apolice_VidaGrupo_{nm}_{c['ano']}.pdf"
    elif k == "pe":
        c["file"] = f"Contrato_PrevidenciaEmpresarial_{nm}_{c['ano']}.pdf"
    elif k == "parceria":
        c["file"] = f"Contrato_ParceriaComercial_{nm}_{c['ano']}.pdf"
    else:
        sub = {"vg": "VidaGrupo"}.get(BY_KEY[c["parent"]]["kind"], "Contrato")
        c["file"] = f"Aditivo_{sub}_{nm}_{c['ano']}.pdf"

# validacao dos documentos
for c in C:
    if c.get("cpf"):
        assert cpf_valid(c["cpf"]), c["cpf"]
    if c.get("rep_cpf"):
        assert cpf_valid(c["rep_cpf"]), c["rep_cpf"]
    if c.get("cnpj"):
        assert cnpj_valid(c["cnpj"]), c["cnpj"]
assert cnpj_valid(FONTARA_CNPJ)


def renov_txt(c):
    return f"Sim (aviso prévio de {c['aviso']} dias)" if c["renov"] else "Não"


def status_txt(c):
    d = (c["end"] - TODAY).days
    if d < 0:
        return f"VENCIDO há {-d} dias"
    return f"vence em {d} dias"


def p_(t):
    return Paragraph(t, ST_BODY)


def renewal_clause(c):
    if c["renov"]:
        return (f"O presente instrumento será renovado automaticamente por períodos iguais e sucessivos de 12 (doze) meses, "
                f"salvo manifestação em contrário de qualquer das partes, por escrito, com antecedência mínima de {c['aviso']} "
                f"({c['aviso']}) dias do término da vigência, ou seja, até {d_br(c['end'] - dt.timedelta(days=c['aviso']))}. "
                f"Renovação automática: SIM. Aviso prévio para não renovação: {c['aviso']} dias.")
    return ("O presente instrumento NÃO será renovado automaticamente. Findo o prazo de vigência, cessam os efeitos do contrato, "
            "salvo celebração de novo instrumento ou aditivo expresso entre as partes. Renovação automática: NÃO. "
            "Aviso prévio para não renovação: não se aplica.")


def foro_clause(c):
    return (f"As partes elegem o foro da {c['foro']}, com renúncia expressa a qualquer outro, por mais privilegiado que seja, "
            f"para dirimir quaisquer controvérsias oriundas deste instrumento. Foro de eleição: {c['foro']}.")


def common_tail(c):
    return [
        ("Do tratamento de dados pessoais (LGPD)", [
            "As partes comprometem-se a tratar os dados pessoais a que tiverem acesso em razão deste instrumento em conformidade com a Lei nº 13.709/2018 (LGPD), "
            "limitando o tratamento às finalidades contratuais, adotando medidas de segurança técnicas e administrativas aptas a proteger tais dados contra acessos não autorizados, "
            "e comunicando à outra parte, em prazo razoável, a ocorrência de qualquer incidente de segurança que possa acarretar risco ou dano relevante aos titulares."]),
        ("Das comunicações", [
            "Todas as comunicações relativas a este instrumento serão realizadas por escrito, preferencialmente por meio eletrônico, aos endereços constantes do quadro resumo, "
            "considerando-se válidas e eficazes as notificações enviadas por e-mail com confirmação de leitura ou por correspondência com aviso de recebimento."]),
        ("Das disposições gerais", [
            "A eventual tolerância de qualquer das partes quanto ao descumprimento de obrigação pela outra não importará novação nem renúncia de direito. "
            "Caso qualquer disposição deste instrumento seja considerada inválida ou ineficaz, as demais permanecerão em pleno vigor. "
            "Este instrumento obriga as partes e seus sucessores a qualquer título, sendo vedada a cessão de direitos ou obrigações sem a anuência prévia e expressa da outra parte.",
            "As partes reconhecem a validade, a autenticidade e a eficácia probatória da assinatura eletrônica deste documento, nos termos da Medida Provisória nº 2.200-2/2001 "
            "e da Lei nº 14.063/2020, ainda que realizada por meio de plataforma de terceiro."]),
        ("Do foro", [foro_clause(c)]),
    ]


def clauses_for(c):
    k = c["kind"]
    ini, fim = d_ext(c["start"]), d_ext(c["end"])
    cl = []
    if k == "cert":
        isp = c["prod_line"] == "PGBL"
        cl += [
            ("Do objeto", [
                f"O presente Certificado formaliza a adesão do Participante {c['nome']}, inscrito no CPF sob o nº {c['cpf']}, ao plano de previdência privada "
                f"{c['produto']} ({c['prod_line']}), operado pela Fontara Seguros S.A., CNPJ {FONTARA_CNPJ}, sob a modalidade de contribuição variável, "
                "com a finalidade de constituição de reserva para complementação de renda."]),
            ("Da vigência e do período de diferimento", [
                f"A vigência deste Certificado tem início em {d_ext(c['start'])} ({d_br(c['start'])}) e término em {fim} ({d_br(c['end'])}), "
                f"correspondente ao fim do período de diferimento contratado, de {c['years']} anos. Data de início da vigência: {d_br(c['start'])}. "
                f"Data de término: {d_br(c['end'])}.",
                "Findo o período de diferimento, o Participante poderá optar pelo recebimento da reserva sob a forma de renda temporária, renda vitalícia ou pagamento único, "
                "conforme as opções previstas no regulamento."]),
            ("Das contribuições", [
                f"{c['valor_tipo']}: {brl(c['valor'])} (valor mensal), a ser debitada em conta indicada pelo Participante até o dia 10 de cada mês. "
                "O valor será reajustado anualmente, na data de aniversário do certificado, pela variação positiva do IPCA/IBGE acumulado nos 12 meses anteriores, "
                "podendo o Participante recusar o reajuste mediante comunicação prévia.",
                "O atraso superior a 90 (noventa) dias no pagamento das contribuições poderá acarretar a suspensão do plano, mantendo-se a reserva já constituída."]),
            ("Da renovação", [renewal_clause(c)]),
            ("Dos encargos", [
                "Incidirão taxa de administração de 1,20% (um vírgula vinte por cento) ao ano sobre o saldo da provisão matemática e carregamento de 3% (três por cento) sobre cada contribuição, "
                "conforme detalhado no regulamento aprovado pela SUSEP."]),
            ("Do resgate e da portabilidade", [
                "O Participante poderá solicitar resgate total ou parcial ou a portabilidade da reserva após o cumprimento da carência de 60 (sessenta) dias para o primeiro resgate "
                "e de 60 (sessenta) dias entre resgates subsequentes. O pagamento será efetuado em até 10 (dez) dias úteis contados do recebimento da solicitação completa."]),
            ("Da tributação", [
                ("Por tratar-se de plano PGBL, as contribuições poderão ser deduzidas da base de cálculo do Imposto de Renda da Pessoa Física até o limite de 12% (doze por cento) "
                 "da renda bruta tributável anual, incidindo IR sobre o valor total do resgate ou da renda recebida."
                 if isp else
                 "Por tratar-se de plano VGBL, não há dedução das contribuições na base de cálculo do Imposto de Renda, incidindo IR apenas sobre os rendimentos no resgate ou na renda recebida.") +
                " O Participante declara ter optado pelo regime de tributação regressivo/progressivo constante do formulário de adesão."]),
            ("Dos beneficiários", [
                "Em caso de falecimento do Participante durante o período de diferimento, a reserva acumulada será paga aos beneficiários por ele indicados no formulário de adesão, "
                "podendo a indicação ser alterada a qualquer tempo mediante comunicação escrita à Fontara Seguros."]),
        ]
    elif k == "vida":
        cl += [
            ("Do objeto e das coberturas", [
                f"A Fontara Seguros S.A., CNPJ {FONTARA_CNPJ}, doravante Seguradora, garante ao Segurado {c['nome']}, CPF nº {c['cpf']}, "
                f"o pagamento de indenização aos beneficiários ou ao próprio Segurado, conforme o caso, na ocorrência dos eventos cobertos do produto {c['produto']}: "
                "(i) morte natural ou acidental; (ii) invalidez permanente total ou parcial por acidente; (iii) diagnóstico de doenças graves (antecipação de até 50% do capital); "
                "(iv) assistência funeral familiar até R$ 15.000,00."]),
            ("Do capital segurado e do prêmio", [
                f"{c['valor_tipo']}: {brl(c['valor'])}. O prêmio mensal é de {brl(c['premio'])}, pago por boleto ou débito em conta, atualizado anualmente na data de aniversário da apólice "
                "pela variação do IPCA/IBGE. O capital segurado é atualizado pelo mesmo índice."]),
            ("Da vigência", [
                f"A vigência desta apólice inicia-se às 24 horas de {ini} ({d_br(c['start'])}) e encerra-se às 24 horas de {fim} ({d_br(c['end'])}). "
                f"Data de início da vigência: {d_br(c['start'])}. Data de término da vigência: {d_br(c['end'])}."]),
            ("Da renovação", [renewal_clause(c)]),
            ("Das carências e exclusões", [
                "Aplica-se prazo de carência de 24 (vinte e quatro) meses para suicídio ou sua tentativa nos termos do art. 798 do Código Civil. "
                "Estão excluídos da cobertura os eventos decorrentes de atos ilícitos dolosos do Segurado, guerra civil ou internacional, "
                "participação em atividades de risco extremo não declaradas, uso de substâncias entorpecentes sem prescrição e demais exclusões constantes das Condições Gerais."]),
            ("Do aviso e da regulação de sinistro", [
                "Ocorrido o sinistro, o Beneficiário deverá comunicá-lo à Seguradora imediatamente e apresentar a documentação listada nas Condições Gerais. "
                "A Seguradora pagará a indenização em até 30 (trinta) dias contados da entrega do último documento exigido, sob pena de atualização monetária e juros de mora."]),
            ("Dos beneficiários", [
                "Os beneficiários são aqueles designados pelo Segurado na proposta de adesão, podendo ser alterados por simples comunicação escrita, "
                "exceto se houver indicação irrevogável. Na falta de indicação, observar-se-á o art. 792 do Código Civil."]),
            ("Do cancelamento", [
                "O Segurado poderá cancelar a apólice a qualquer tempo, mediante comunicação por escrito, sem prejuízo das parcelas vencidas. "
                "A Seguradora poderá cancelar a apólice em caso de inadimplência superior a 60 (sessenta) dias, após notificação prévia."]),
        ]
    elif k == "vg":
        cl += [
            ("Do objeto", [
                f"Pela presente Apólice, a Fontara Seguros S.A., CNPJ {FONTARA_CNPJ}, doravante Seguradora, garante aos segurados do grupo vinculado à Estipulante "
                f"{c['nome']}, inscrita no CNPJ sob o nº {c['cnpj']}, as coberturas do produto {c['produto']}, na modalidade de seguro de vida em grupo "
                "com adesão contributária/não contributária, conforme descrito no quadro resumo."]),
            ("Do grupo segurado e do capital", [
                f"O grupo segurado é composto por {c['vidas']} empregados ativos na data de início da vigência. "
                f"O capital segurado individual corresponde a {c['cap_mult']} vezes o salário nominal mensal, limitado a R$ 1.500.000,00 por vida. "
                f"{c['valor_tipo']}: {brl(c['valor'])}.",
                "Poderão ser incluídos novos segurados mediante comunicação mensal da Estipulante até o dia 20, observadas as regras de aceitação e o limite de capital sem declaração pessoal de saúde."]),
            ("Das coberturas", [
                "Estão garantidas as coberturas de morte natural ou acidental, invalidez permanente total ou parcial por acidente, invalidez funcional permanente total por doença, "
                "assistência funeral e, opcionalmente, doenças graves, conforme discriminado no quadro resumo."]),
            ("Da vigência", [
                f"A vigência desta apólice tem início em {ini} ({d_br(c['start'])}) e término em {fim} ({d_br(c['end'])}). "
                f"Data de início: {d_br(c['start'])}. Data de término: {d_br(c['end'])}."]),
            ("Da renovação e do reajuste", [
                renewal_clause(c),
                "A cada renovação, o prêmio poderá ser reajustado em função da sinistralidade apurada no período, observada a nota técnica atuarial e a regulamentação vigente."]),
            ("Das obrigações da Estipulante", [
                "A Estipulante obriga-se a: (i) fornecer à Seguradora a relação nominal dos segurados com CPF, salário e data de nascimento; (ii) repassar os prêmios até o dia 10 de cada mês; "
                "(iii) comunicar imediatamente desligamentos e demais alterações do grupo; (iv) dar ciência aos segurados das condições do seguro; e (v) não onerar ou cobrar dos segurados "
                "valor superior ao prêmio devido."]),
            ("Do sinistro", [
                "A Estipulante auxiliará os beneficiários na apresentação da documentação necessária. A Seguradora efetuará o pagamento da indenização em até 30 dias após a entrega "
                "do último documento exigido para a regulação."]),
            ("Do cancelamento", [
                "A apólice poderá ser rescindida por qualquer das partes mediante aviso por escrito com antecedência mínima de 60 (sessenta) dias, observada a manutenção das coberturas "
                "dos segurados já em gozo de benefício."]),
        ]
    elif k == "pe":
        cl += [
            ("Do objeto", [
                f"O presente Contrato disciplina a instituição, pela Patrocinadora {c['nome']}, CNPJ {c['cnpj']}, do plano de previdência complementar aberta "
                f"{c['produto']}, operado pela Fontara Seguros S.A., CNPJ {FONTARA_CNPJ}, em benefício de seus colaboradores elegíveis ({c['vidas']} participantes na data de assinatura)."]),
            ("Da vigência", [
                f"O contrato vigorará de {d_br(c['start'])} ({ini}) até {d_br(c['end'])} ({fim}). "
                f"Data de início: {d_br(c['start'])}. Data de término: {d_br(c['end'])}."]),
            ("Da renovação", [renewal_clause(c)]),
            ("Das contribuições", [
                f"{c['valor_tipo']}: {brl(c['valor'])}, correspondentes à contrapartida da Patrocinadora de até 100% da contribuição básica do participante, limitada a 6% do salário. "
                "O repasse deverá ocorrer até o 5º dia útil de cada mês, sob pena de multa de 2% e juros de 1% ao mês."]),
            ("Da elegibilidade e do vesting", [
                "São elegíveis os colaboradores com mais de 6 (seis) meses de vínculo. O direito ao resgate da parcela patronal observa a escala de carência (vesting): 0% até o 12º mês, "
                "50% do 13º ao 24º mês e 100% a partir do 25º mês de participação."]),
            ("Da portabilidade e do resgate", [
                "Os participantes poderão exercer portabilidade para outro plano ou solicitar resgate nos termos do regulamento, preservada a tributação escolhida no ato da adesão."]),
            ("Das obrigações da Fontara Seguros", [
                "Compete à Seguradora administrar os recursos, emitir extratos quadrimestrais, disponibilizar canal de atendimento e prestar contas à Patrocinadora e aos participantes, "
                "bem como cumprir a legislação aplicável aos planos de previdência complementar aberta."]),
            ("Da rescisão", [
                "A Patrocinadora poderá rescindir o contrato mediante aviso por escrito com antecedência mínima de 120 (cento e vinte) dias, sem prejuízo dos direitos adquiridos pelos participantes."]),
        ]
    elif k == "parceria":
        cl += [
            ("Do objeto", [
                f"O presente Contrato estabelece os termos da parceria comercial entre a Fontara Seguros S.A., CNPJ {FONTARA_CNPJ} (\"Fontara\"), e {c['nome']}, "
                f"CNPJ nº {c['cnpj']} (\"Correspondente\"), correspondente bancário, para a divulgação e a intermediação de propostas de {c['produto']}, "
                "sem exclusividade, por meio do Canal Parceiro da Fontara."]),
            ("Da vigência", [
                f"O contrato vigorará por {c['years']} (cinco) anos, iniciando-se em {d_br(c['start'])} ({ini}) e encerrando-se em {d_br(c['end'])} ({fim}). "
                f"Data de início: {d_br(c['start'])}. Data de término: {d_br(c['end'])}."]),
            ("Da renovação", [renewal_clause(c)]),
            ("Da remuneração", [
                f"Pela intermediação, a Fontara pagará ao Correspondente: (i) comissão de {str(c['comissao']).replace('.', ',')}% sobre o prêmio ou contribuição inicial emitido; e "
                f"(ii) {c['valor_tipo'].lower()} de {brl(c['valor'])}, pago mensalmente até o 10º dia útil, a título de remuneração por estrutura de atendimento. "
                f"Valor mensal fixo: {brl(c['valor'])}."]),
            ("Das obrigações do Correspondente", [
                "O Correspondente obriga-se a: (i) observar as normas da SUSEP e do Banco Central do Brasil; (ii) manter treinamento certificado de seus colaboradores; "
                "(iii) não prestar informações enganosas sobre produtos; (iv) manter a confidencialidade das informações; e (v) permitir auditorias razoáveis da Fontara."]),
            ("Da conformidade e anticorrupção", [
                "As partes declaram conhecer e cumprir a Lei nº 12.846/2013 (Lei Anticorrupção), a Lei nº 9.613/1998 (prevenção à lavagem de dinheiro) e as políticas de integridade da Fontara, "
                "obrigando-se a não oferecer vantagem indevida a agentes públicos ou privados."]),
            ("Da rescisão", [
                f"Qualquer das partes poderá rescindir o contrato, sem justa causa, mediante aviso por escrito com antecedência mínima de {c['aviso']} dias. "
                "A rescisão por justa causa independe de aviso prévio nos casos de descumprimento grave, fraude ou perda de autorização regulatória."]),
        ]
    else:  # aditivo
        cl += [
            ("Dos considerandos", [
                f"As partes celebraram, em {d_br(c['parent_inicio'])}, o contrato/apólice nº {c['parent_num']} (\"Contrato Principal\"), referente ao produto {c['produto']}, "
                "e, de comum acordo, resolvem alterá-lo nos termos deste Aditivo, que dele passa a fazer parte integrante."]),
            ("Do objeto do aditivo", [
                f"Este Aditivo, referente ao Contrato Principal nº {c['parent_num']}, altera o número de vidas do grupo para {c['vidas']}, "
                f"mantendo-se o capital segurado de {c['cap_mult']} vezes o salário nominal, e ajusta o valor do prêmio/contribuição para {brl(c['valor'])} mensais "
                f"({c['valor_tipo']})."
                if c.get("cap_mult") else
                f"Este Aditivo, referente ao Contrato Principal nº {c['parent_num']}, ajusta o valor para {brl(c['valor'])} mensais."]),
            ("Da vigência do aditivo", [
                f"As alterações produzem efeitos a partir de {d_ext(c['start'])} ({d_br(c['start'])}) e vigoram até o término do Contrato Principal, em {fim} ({d_br(c['end'])}). "
                f"Início de vigência do aditivo: {d_br(c['start'])}. Data de término: {d_br(c['end'])}."]),
            ("Da renovação", [renewal_clause(c)]),
            ("Da ratificação", [
                "Permanecem inalteradas e em pleno vigor todas as demais cláusulas e condições do Contrato Principal que não tenham sido expressamente modificadas por este Aditivo. "
                "Em caso de conflito, prevalecem as disposições deste Aditivo."]),
        ]
    cl += common_tail(c)
    return cl


def resumo_rows(c):
    k = c["kind"]
    if c["pj"]:
        parte = ("Estipulante" if k in ("vg", "aditivo") else "Patrocinadora" if k == "pe" else "Correspondente")
        rows = [(parte, c["nome"]), ("CNPJ", c["cnpj"]),
                ("Representante legal", f"{c['rep']} - CPF {c['rep_cpf']} ({c['rep_cargo']})")]
    else:
        rows = [("Segurado/Participante", c["nome"]), ("CPF", c["cpf"])]
    rows += [("Seguradora", f"Fontara Seguros S.A. - CNPJ {FONTARA_CNPJ}"),
             ("Produto", c["produto"])]
    if k == "aditivo":
        rows.append(("Contrato principal", c["parent_num"]))
    rows += [("Início de vigência", d_br(c["start"])), ("Término / vencimento", d_br(c["end"])),
             ("Renovação automática", renov_txt(c)), (c["valor_tipo"], brl(c["valor"]))]
    if c.get("premio"):
        rows.append(("Prêmio mensal", brl(c["premio"])))
    rows.append(("Foro", c["foro"]))
    return rows


def build_legacy(c):
    k = c["kind"]
    title = {"cert": f"Certificado de Previdência {c.get('prod_line', '')}", "vida": "Apólice de Seguro de Vida Individual",
             "vg": "Apólice de Seguro de Vida em Grupo", "pe": "Contrato de Previdência Empresarial",
             "parceria": "Contrato de Parceria Comercial - Canal Parceiro", "aditivo": "Aditivo Contratual"}[k]
    story = [Paragraph(title.upper(), ST_T),
             Paragraph(f"Nº {c['numero']}  |  Assinado em {d_br(c['sign'])}", ST_SUB),
             Paragraph("QUADRO RESUMO", ST_H)]
    rows = [("Número", c["numero"])] + resumo_rows(c)
    story.append(pdf_kv_table([(a, b) for a, b in rows], cols=1))
    story.append(Spacer(1, 4))
    story.append(p_(f"Pelo presente instrumento particular, de um lado a <b>Fontara Seguros S.A.</b>, inscrita no CNPJ sob o nº {FONTARA_CNPJ}, "
                    f"com sede na Avenida Exemplo, 1.000, São Paulo/SP, e, de outro lado, <b>{c['nome']}</b>, "
                    f"inscrito(a) no {'CNPJ' if c['pj'] else 'CPF'} sob o nº {c['cnpj'] if c['pj'] else c['cpf']}, "
                    f"têm entre si justo e acordado o que segue, firmado em {d_ext(c['sign'])}."))
    for i, (h, paras) in enumerate(clauses_for(c), start=1):
        story.append(Paragraph(f"CLÁUSULA {i}ª - {h.upper()}", ST_H))
        for j, t in enumerate(paras, start=1):
            story.append(p_(f"{i}.{j} {t}" if len(paras) > 1 else t))
    story.append(Spacer(1, 6))
    story.append(p_(f"E, por estarem de acordo, as partes assinam este instrumento. São Paulo/SP, {d_ext(c['sign'])}."))
    sig_l = "Fontara Seguros S.A."
    sig_r = c["nome"] if not c["pj"] else f"{c['nome']} - {c['rep']}"
    sig = Table([[Paragraph("_" * 38, ST_CELL), Paragraph("_" * 38, ST_CELL)],
                 [Paragraph(f"<b>{sig_l}</b><br/>Seguradora", ST_CELL), Paragraph(f"<b>{sig_r}</b>", ST_CELL)]],
                colWidths=[8.5 * cm, 8.5 * cm])
    story.append(Spacer(1, 18))
    story.append(KeepTogether(sig))
    make_pdf(os.path.join(OUT_LEG, c["file"]), f"{title} {c['numero']}", story)


def write_index():
    L = []
    L.append("# Legados Fontara - Ground truth para validação da extração por IA\n")
    L.append(f"Gerado em **{d_br(TODAY)}** (datas de vencimento calculadas a partir desta data; "
             "execute `python generate.py` novamente para recalcular). Todos os dados são fictícios; CPFs/CNPJs têm dígitos verificadores válidos.\n")
    L.append(f"Seguradora (todos os contratos): Fontara Seguros S.A. - CNPJ {FONTARA_CNPJ}\n")
    L.append("| # | Arquivo | Tipo | PF/PJ | Parte | CPF/CNPJ | Produto | Nº | Início | Vencimento | Situação | Valor | Renovação | Foro |")
    L.append("|---|---------|------|-------|-------|----------|---------|----|--------|------------|----------|-------|-----------|------|")
    for i, c in enumerate(C, start=1):
        doc_ = c["cnpj"] if c["pj"] else c["cpf"]
        extra = f" (ref. {c['parent_num']})" if c["kind"] == "aditivo" else ""
        valor = f"{brl(c['valor'])} ({c['valor_tipo'].lower()})"
        L.append(f"| {i} | `{c['file']}` | {TIPO_LABEL[c['kind']]}{extra} | {'PJ' if c['pj'] else 'PF'} | {c['nome']} | {doc_} | "
                 f"{c['produto']} | {c['numero']} | {d_br(c['start'])} | {d_br(c['end'])} | {status_txt(c)} | {valor} | {renov_txt(c)} | {c['foro']} |")
    L.append("\n## Observações\n")
    L.append("- Aditivos (13 e 14): início = data de vigência do aditivo; vencimento = vencimento do contrato principal (inalterado); valor = valor pós-aditivo. O valor do contrato principal é o da linha do próprio contrato.")
    L.append("- Em certificados de previdência, \"vencimento\" = fim do período de diferimento. Em apólices de vida individual, o valor principal é o capital segurado (o prêmio mensal também consta no texto).")
    L.append("- Parceria comercial: \"valor\" = fee mensal fixo; há ainda comissão de 4,5% sobre prêmio emitido.")
    L.append("- Cada PDF informa representante legal (PJ) com CPF fictício válido no quadro resumo.\n")
    in30 = [c for c in C if 0 <= (c["end"] - TODAY).days <= 30]
    in90 = [c for c in C if 31 <= (c["end"] - TODAY).days <= 90]
    exp = [c for c in C if (c["end"] - TODAY).days < 0]
    L.append("## Cenários de vencimento (respostas esperadas)\n")
    L.append(f"- Vencem em até 30 dias ({len(in30)}): " + "; ".join(f"{c['numero']} ({d_br(c['end'])})" for c in in30))
    L.append(f"- Vencem entre 31 e 90 dias ({len(in90)}): " + "; ".join(f"{c['numero']} ({d_br(c['end'])})" for c in in90))
    L.append(f"- Já vencidos ({len(exp)}): " + "; ".join(f"{c['numero']} ({d_br(c['end'])})" for c in exp))
    L.append("- Os demais vencem entre 6 e 24 meses.\n")
    vg1, vg3 = BY_KEY["vg1"], BY_KEY["vg3"]
    L.append("## 5 perguntas sugeridas para a demo\n")
    L.append(f"1. \"Quais contratos do CNPJ {vg3['cnpj']} vencem nos próximos 90 dias?\" -> {BY_KEY['vg3']['numero']} e o aditivo {BY_KEY['ad2']['numero']} (ambos vencem em {d_br(vg3['end'])}).")
    L.append("2. \"Liste todos os contratos que vencem nos próximos 30 dias e que NÃO têm renovação automática.\" -> "
             + ", ".join(c["numero"] for c in in30 if not c["renov"]) + ".")
    L.append("3. \"Quais contratos já estão vencidos e qual o valor mensal de cada um?\" -> "
             + "; ".join(f"{c['numero']} ({brl(c['valor'])})" for c in exp) + ".")
    L.append(f"4. \"Qual o prazo de aviso prévio para não renovação da apólice {vg1['numero']} e do seu aditivo?\" -> {vg1['aviso']} dias (aditivo {BY_KEY['ad1']['numero']} também {BY_KEY['ad1']['aviso']} dias).")
    L.append("5. \"Quais contratos têm foro em Belo Horizonte/MG e qual o somatório de prêmios/contribuições mensais deles?\" -> "
             + "; ".join(f"{c['numero']} ({brl(c['valor'])})" for c in C if "Belo Horizonte" in c["foro"]) + ".")
    L.append("\nOutras ideias: \"Quais são os contratos PJ assinados antes de 2022?\"; \"Existe algum aditivo? A qual contrato principal se refere?\"; \"Qual o capital segurado da apólice de Cecília Montenegro Duarte Demo?\".")
    with open(os.path.join(OUT_LEG, "INDEX.md"), "w", encoding="utf-8") as f:
        f.write("\n".join(L) + "\n")


def main():
    build_pf()
    build_pj()
    build_resgate_docx()
    build_resgate_pdf()
    build_resgate_pdf(esign=True)
    build_proposta_pdf("PF")
    build_proposta_pdf("PJ")
    for c in C:
        build_legacy(c)
    write_index()
    print("OK:", len(C), "contratos legados gerados em", OUT_LEG)


if __name__ == "__main__":
    main()
