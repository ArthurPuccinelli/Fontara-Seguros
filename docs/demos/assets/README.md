# Assets de demo - Fontara Seguros (vida e previdência)

Todos os documentos são **fictícios** (pt-BR). CPFs e CNPJs são inventados, porém com dígitos verificadores válidos (algoritmos implementados em `generate.py`). Cada página/rodapé traz o aviso "Documento fictício para demonstração".

## Arquivos

### `doc-gen/` - Templates Word para DocuSign Doc Gen
Placeholders no formato `{{NomeDoCampo}}` (sem espaços, alfanuméricos). Âncoras de assinatura em texto branco 6pt (`/assinatura_xxx/`) para uso com Anchor Tags / posicionamento automático de campos.

| Arquivo | Campos Doc Gen | Âncoras |
|---|---|---|
| `Proposta_Adesao_PF.docx` | NumeroProposta, DataProposta, NomeTitular, CpfTitular, EmailTitular, CelularTitular, DataNascimento, Endereco, Produto, ValorContribuicao, Periodicidade, Beneficiarios, Canal, Corretor | `/assinatura_titular/`, `/data_titular/` |
| `Proposta_Adesao_PJ.docx` | NumeroProposta, DataProposta, RazaoSocial, Cnpj, Produto, ValorContribuicao, Periodicidade, Canal, Rep1Nome, Rep1Cpf, Rep1Cargo, Rep2Nome, Rep2Cpf, Rep2Cargo, Rep3Nome, Rep3Cpf, Rep3Cargo, Test1Nome, Test2Nome | `/assinatura_rep1/`, `/assinatura_rep2/`, `/assinatura_rep3/`, `/assinatura_test1/`, `/assinatura_test2/` |
| `Solicitacao_Resgate_Portabilidade.docx` | NomeTitular, CpfTitular, NumeroCertificado, TipoSolicitacao, ValorResgate, EntidadeDestino, CnpjEntidadeDestino, Banco, Agencia, Conta, DataSolicitacao | `/assinatura_titular/` |
| `Solicitacao_Resgate_Portabilidade.pdf` | Mesmo layout do .docx, com os placeholders mantidos como texto (útil como documento-fonte do Web Forms) | `/assinatura_titular/` |

**Uso:** em DocuSign eSignature, *Templates > New > Create Template*, faça upload do `.docx` e, ao detectar campos Doc Gen (`{{...}}`), habilite-os no template. Depois, envie o envelope/template informando os valores dos campos (via API, Maestro ou Web Forms). Associe os papéis (Titular, Representante 1-3, Testemunha 1-2) às âncoras.

### `legados/` - 14 contratos legados para extração por IA
PDFs de texto (2 páginas cada) com quadro resumo e cláusulas explícitas: número, partes, CPF/CNPJ, produto, início e término da vigência, renovação automática e aviso prévio, valor (prêmio/contribuição/capital/fee) e foro. Mix: 6 PF (certificados PGBL/VGBL e apólices de vida individual), 6 PJ (vida em grupo, previdência empresarial, parceria comercial Canal Parceiro) e 2 aditivos que referenciam o número do contrato principal.

`legados/INDEX.md` é o **gabarito (ground truth)** para validar a extração, e traz 5 perguntas sugeridas para a demo.

**Uso:** faça upload dos PDFs no DocuSign Navigator / Agreement Manager (IAM) para que a IA extraia os atributos; compare com `INDEX.md` e faça as perguntas sugeridas.

> Os vencimentos são calculados a partir de `date.today()` no momento da geração (4 vencem em até 30 dias, 3 entre 31 e 90 dias, 2 já vencidos, 5 entre 6 e 24 meses). **Reexecute o gerador antes de cada demo** e use o `INDEX.md` regenerado.

## Como regenerar

```bash
python3 -m venv venv && . venv/bin/activate
pip install python-docx reportlab
cd docs/demos/assets
python generate.py
```

O script usa o logo `public/logo.png` e sobrescreve todos os arquivos de `doc-gen/` e `legados/` (incluindo `INDEX.md`).
