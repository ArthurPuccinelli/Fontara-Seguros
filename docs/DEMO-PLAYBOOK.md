# DocuSign IAM — Playbook de Demos (compartilhado)

O playbook é uma **skill do Claude Code compartilhada pelo time**, versionada no GitHub:

**Repositório (privado):** https://github.com/ArthurPuccinelli/docusign-demo-playbook
**Guia completo de instalação e uso:** [`INSTALACAO.md`](https://github.com/ArthurPuccinelli/docusign-demo-playbook/blob/main/INSTALACAO.md)

## Instalação rápida (uma vez por máquina)
Requisitos: acesso ao repositório (convite do dono), `git`, `python3` e `gh` autenticado (`gh auth login`).
```bash
git -c credential.helper= -c credential.helper='!gh auth git-credential' \
  clone https://github.com/ArthurPuccinelli/docusign-demo-playbook.git ~/.claude/skills/docusign-demo-playbook
~/.claude/skills/docusign-demo-playbook/install.sh
~/.claude/skills/docusign-demo-playbook/scripts/doctor.sh   # verifica tudo; esperado: 0 problema(s)
```
Depois, abra uma nova sessão do Claude Code.

## Como funciona
- **Leitura:** o Claude lê a cópia local em `~/.claude/skills/docusign-demo-playbook`.
- **Atualização:** no início de cada sessão, o hook faz `git pull`. Se estiver offline ou sem login, segue com a cópia local e avisa.
- **Contribuição:** no fim da sessão, o hook pede o registro e o Claude roda `scripts/contribute.sh "título"`. Isso abre um **pull request**, que passa pelo guard de dados sensíveis e pela aprovação do dono.
- **Chat:** baixe o zip em Releases → `latest` e envie em claude.ai → Skills. Não ative na mesma conta em que usa o clone no Code.

## O que vai onde
- **Playbook:** conhecimento reutilizável (pegadinhas, endpoints, navegação, receitas), com data e sem IDs ou dados de cliente.
- **Este projeto:** o que é específico dele (IDs, roteiro, estado) fica em [`demos/caixa-vida-previdencia.md`](demos/caixa-vida-previdencia.md) e [`HANDOFF.md`](HANDOFF.md).
