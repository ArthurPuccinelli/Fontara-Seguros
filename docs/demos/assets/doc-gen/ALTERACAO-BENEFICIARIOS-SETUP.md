# Setup: modelo de documento "Alteração de Beneficiários" (demo C5)

Estado em 19/11/2026: publicado (v4) e validado de ponta a ponta. Este arquivo registra **como foi montado**, para refazer em outra conta.

## Peças na DocuSign
| Peça | Nome | ID |
|---|---|---|
| Modelo de documento (Modelos → Modelos de documentos) | Fontara Seguros - Alteração Beneficiários | `52cca5f1-a378-444e-aede-600250756e12` |
| Modelo de envelope (Modelos → Meus modelos) | Fontara Seguros - Alteracao de Beneficiarios (embarcado) | `fdd421a2-7ec1-4f6f-ad46-edea1a9e6301` |

## 1. Modelo de documento
1. **Criar novo:** upload de `Alteracao_Beneficiarios_Fontara.docx`, gerado por `../build_alteracao_beneficiarios.py`.
2. **Campos de Remetente:** criados com **+ → Campo** sobre cada marcador `{{...}}`.
   - Protocolo, DataSolicitacao, NomeSegurado (2x), CpfSegurado, Certificado.
   - `Produto`: lista `Vida; Previdência;`.
   - `TemMenor`: lista `Sim; Não;`.
3. **Tabela dinâmica:** **+ → Tabela → Tabela dinâmica**, 3 colunas.
   - Nome da tabela: `Beneficiarios`. Campos: `Nome`, `Parentesco`, `Percentual`.
   - A tabela estática Benef1–3 foi excluída.
4. **Regras:** selecione título e parágrafo e use o botão flutuante **Rule**.
   - "Clausula Vida": Se `Produto` igual a `Vida` → cláusula de vida. **Ou se** `Produto` igual a `Previdência` → cláusula de previdência. É um bloco só, com duas variantes (setas < >).
   - "Clausula Menor": Se `TemMenor` igual a `Sim` → cláusula do menor. Cuidado para não incluir as declarações seguintes no bloco.
5. **Assinatura:** com o seletor em **Signatário 1**, arraste **Assinatura** (acima da linha do nome) e **Data da assinatura**. Elas acompanham o conteúdo quando a tabela cresce.
6. **Salvar e publicar.**

## 2. Modelo de envelope
1. **Iniciar → Modelos de envelopes → Criar um modelo**.
2. Em Fazer upload, escolha **Modelos de documentos** e selecione o modelo.
3. O papel "Signatário 1" fica **vinculado ao modelo de documento**. Não renomeie.
4. Salvar e fechar.

## 3. Uso pela API
Implementado em `src/lib/docusign/esign.ts`, função `createBeneficiariosEnvelope`.
1. `POST /envelopes` com `{templateId, status:"created", templateRoles:[{roleName:"Signatário 1", name, email, clientUserId}]}`.
2. `GET .../docGenFormFields`. Os nomes técnicos são gerados (`/C_Produto_vCw26s`): case pelo **label**. A tabela vem como `type:"TableRow"`, com a definição em `rowValues[0].docGenFormFieldList`.
3. `PUT .../docGenFormFields`:
   - campos simples: `{name, value}`;
   - tabela: `{name, type:"TableRow", rowValues:[{docGenFormFieldList:[{name:<col>, value}]}...]}`, com todas as colunas em cada linha.
4. `PUT /envelopes/{id}` com `{status:"sent"}`. Em seguida, `createRecipientView` (Focused View ou Clássica).

## Pegadinhas
- **Tabs no modelo de envelope:** os campos de assinatura postos no modelo de envelope (UI ou API) são **apagados** quando o modelo de documento é publicado de novo, porque o papel está vinculado. Coloque a assinatura **no modelo de documento**.
- **Destaque herdado:** o destaque amarelo dos marcadores do .docx foi herdado pelos valores preenchidos. Removido com "Remover cor" (selecionar tudo → Cor de destaque).
- **Espaço para assinar:** deixe espaço em branco acima da linha de assinatura no .docx.
