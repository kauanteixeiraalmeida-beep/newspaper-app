# Jornal Digital

Um app simples para publicar edições de um jornal digital, com upload de arquivos em diferentes formatos como Canva, Word, LibreOffice, PDF e imagens.

## O que ele faz

- Cadastrar uma nova edição do jornal
- Informar título, edição, data, categoria e resumo
- Anexar arquivo do jornal em PDF, imagem, Word, LibreOffice ou apresentação
- Visualizar a publicação em uma lista de edições recentes
- Abrir o material completo em uma janela modal
- Persistir os dados no navegador usando localStorage

## Como executar

1. Baixe ou clone este repositório.
2. Entre na pasta do projeto.
3. Abra o arquivo `index.html` diretamente no navegador.

Ou, se preferir, rode um servidor local:

```bash
cd pasta-do-projeto
python3 -m http.server 8000
```

Depois acesse:

```bash
http://localhost:8000
```

## Estrutura do projeto

- `index.html` — interface principal do app
- `style.css` — layout e visual do jornal
- `app.js` — lógica para salvar, listar e visualizar edições

## Personalização

Você pode ajustar:

- Cores e identidade visual
- Campos do formulário
- Tipos de categoria
- Layout da página pública
- Persistência via backend real (Supabase, Firebase, PostgreSQL)

## Próximo passo recomendado

Para transformar isso em um app profissional, eu posso continuar e criar uma versão com:

- painel administrativo em React
- autenticação de usuário
- banco de dados
- upload para cloud storage
- página pública com busca e filtros
- versão mobile

Se quiser, eu posso fazer a versão completa com React + Supabase agora.
