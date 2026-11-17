# DocuSign IAM — Playbook de Demos (movido)

O playbook agora é um **skill global do Claude Code**, compartilhado por todos os projetos e atualizado automaticamente por hooks:

- **Cópia canônica:** `~/.claude/skills/docusign-demo-playbook/PLAYBOOK.md`
- **Skill:** `docusign-demo-playbook` (`SKILL.md` diz quando consultar e como atualizar)
- **Hooks** (`~/.claude/settings.json`):
  - no início da sessão, injetam o índice do playbook em projetos DocuSign;
  - no fim, pedem uma vez por sessão o registro de aprendizados.
- **Levar para outra máquina:** `~/.claude/skills/docusign-demo-playbook/export.sh` gera um zip. No destino, rode `install.sh`.

**O que vai onde:**
- Conhecimento reutilizável (pegadinhas, endpoints, navegação, receitas) → no playbook global, com data.
- Específico deste projeto (IDs, roteiro, estado) → [`demos/caixa-vida-previdencia.md`](demos/caixa-vida-previdencia.md) e [`HANDOFF.md`](HANDOFF.md).
