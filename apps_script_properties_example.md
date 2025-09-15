# Exemplo de Script Properties para o Apps Script (RSVP PWA)

Cole as chaves/valores abaixo em *Project Settings* → *Script properties* do seu projeto Apps Script.

IMPORTANTE: NUNCA versionar essas propriedades no repositório. Elas contêm tokens, IDs de planilha e segredos.

## Propriedades obrigatórias

- `VALID_TOKENS`
  - Valor: tokens separados por vírgula
  - Exemplo: `ABC123,DEF456,GHI789`
  - Observação: são os tokens que você vai enviar por WhatsApp (`?t=ABC123`).

- `SHEET_ID_PRIV`
  - Valor: ID da planilha privada (pegar da URL do Google Sheets)
  - Exemplo: `1aBcD_eXamPlE_1234567890`
  - Observação: onde as respostas completas serão gravadas (aba `respostas`).

## Propriedades opcionais, mas recomendadas

- `SHEET_NAME_PRIV`
  - Valor: nome da aba na planilha privada
  - Exemplo: `respostas`

- `SHEET_ID_PUB`
  - Valor: ID da planilha pública (opcional)
  - Exemplo: `1PubLiC_SHeeT_ABCDEFG`
  - Observação: se preenchido, o Apps Script gravará também uma versão anônima nesta planilha.

- `SHEET_NAME_PUB`
  - Valor: nome da aba na planilha pública
  - Exemplo: `anon`

- `ANON_SALT`
  - Valor: uma string aleatória e secreta usada para gerar hashes (SHA-256) dos nomes
  - Exemplo: `s0m3$ecreT-salt`
  - Observação: mantenha este valor secreto (não versionar).

- `TOKEN_SINGLE_USE`
  - Valor: `true` ou `false`
  - Exemplo: `true`
  - Observação: se `true`, cada token só pode ser usado uma vez.

## Propriedades de configuração por token (opcional)

Você pode definir `CONFIG_<TOKEN>` para retornar um JSON de configuração via `doGet? t=<TOKEN>`.

- Exemplo (como chave/valor):
  - Key: `CONFIG_ABC123`
  - Value: `{"title":"Evento – Nome & Outro","date":"11/10/2025","time":"17h00","venue":"Local do Evento","dtStart":"20251011T193000Z","dtEnd":"20251011T213000Z","mapUrl":"https://maps.google.com/"}`

Quando `CONFIG_<TOKEN>` estiver presente, o `doGet` retornará esse JSON e o frontend poderá usá-lo para preencher o conteúdo (sem arquivos locais).

## Exemplo mínimo de conjunto de propriedades

VALID_TOKENS = ABC123,DEF456
SHEET_ID_PRIV = 1aBcD_eXamPlE_1234567890
SHEET_NAME_PRIV = respostas
TOKEN_SINGLE_USE = true
ANON_SALT = s0m3$ecreT-salt

## Como adicionar no Apps Script

1. Abra o editor do Apps Script ([https://script.google.com](https://script.google.com)).
2. No menu à esquerda, abra o ícone de engrenagem → *Project settings* → *Script properties* → *Show*.
3. Clique em *Add property* e cole as chaves e valores conforme acima.

## Segurança e boas práticas

- Gere tokens suficientemente aleatórios (ex.: `openssl rand -hex 8` ou use um gerador online confiável).
- Troque `ANON_SALT` periodicamente se houver suspeita de vazamento.
- Não publique `SHEET_ID_PRIV` em repositórios públicos se houver risco; a planilha por si só não permite escrita sem credenciais, mas IDs podem ser sensíveis se combinados com APIs mal configuradas.
- Para maior segurança, armazene tokens de forma mais forte (hashs) e gere tokens únicos por convidado.

---

Se quiser, eu posso gerar uma lista de tokens de exemplo (ex.: 50 tokens) e um pequeno script para você copiar/colar que cria as propriedades (ou insere `CONFIG_<TOKEN>`). Quer que eu gere essa lista de exemplo agora?
