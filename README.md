# Accounts

Aplicação de terminal (CLI) que simula operações bancárias básicas: criar conta, depositar, consultar saldo e sacar. Cada conta é salva como um arquivo JSON local, sem banco de dados.

Projeto feito com **Node.js**, usando `inquirer` para os menus interativos e `chalk` para colorir as mensagens.

## Funcionalidades

- **Criar conta**: cria uma conta nova a partir de um nome escolhido pelo usuário.
- **Depositar**: adiciona um valor ao saldo de uma conta existente.
- **Consultar saldo**: mostra o saldo atual da conta.
- **Sacar**: retira um valor do saldo, caso haja saldo suficiente.
- **Sair**: encerra o programa.
- **Cancelar**: em qualquer pergunta de nome de conta, digitar `cancelar` volta ao menu principal.

## Tecnologias

- [Node.js](https://nodejs.org/)
- [inquirer](https://www.npmjs.com/package/inquirer) (menus e perguntas no terminal)
- [chalk](https://www.npmjs.com/package/chalk) (cores no terminal)
- Módulo nativo `fs` (leitura e escrita dos arquivos das contas)

## Como executar

1. Clone o repositório e entre na pasta do projeto.

2. Instale as dependências. O código usa `require()` (CommonJS), então é necessário usar versões compatíveis:

   ```bash
   npm install chalk@4 inquirer@8
   ```

   > As versões mais novas dessas bibliotecas (chalk 5+ e inquirer 9+) são apenas ESM e não funcionam com `require()`.

3. Rode o programa:

   ```bash
   node index.js
   ```

## Como funciona

### Fluxo geral

```
operation() ──► menu principal (inquirer, tipo "list")
   │
   ├── Criar conta     ──► createAccount() ──► buildAccount()
   ├── Depositar       ──► deposit()       ──► checkAccount() ──► addAmount()
   ├── Consultar saldo ──► getAccountBalance() ──► checkAccount() ──► getAccount()
   ├── Sacar           ──► withdraw()      ──► checkAccount() ──► removeAmount()
   └── Sair            ──► encerra com process.exit()
```

Ao terminar cada operação, o programa espera 3 segundos (`setTimeout`) para o usuário ler a mensagem e então volta ao menu principal.

### Armazenamento

As contas ficam na pasta `accounts/`, criada automaticamente na primeira vez que uma conta é cadastrada. Cada conta é um arquivo `accounts/<nome-da-conta>.json` com o seguinte formato:

```json
{"balance": 0}
```

Todas as operações de leitura e escrita passam por esse arquivo.

### Funções

| Função | O que faz |
| --- | --- |
| `operation()` | Exibe o menu principal e chama a função correspondente à escolha do usuário. |
| `createAccount()` | Mostra a mensagem de boas-vindas e chama `buildAccount()`. |
| `buildAccount()` | Pergunta o nome da conta, cria a pasta `accounts/` se necessário, impede nomes repetidos e grava o arquivo JSON com saldo `0`. |
| `deposit()` | Pergunta o nome da conta e o valor, e chama `addAmount()`. |
| `checkAccount(accountName)` | Verifica se o arquivo da conta existe. Retorna `true` ou `false` e exibe aviso de erro quando não existe. |
| `addAmount(accountName, amount)` | Soma o valor ao saldo e regrava o arquivo JSON. Se o valor vier vazio, reinicia o depósito. |
| `getAccount(accountName)` | Lê o arquivo JSON da conta e retorna o conteúdo como objeto. |
| `getAccountBalance()` | Pergunta o nome da conta e exibe o saldo. |
| `withdraw()` | Pergunta o nome da conta e o valor, e chama `removeAmount()`. |
| `removeAmount(accountName, amount)` | Verifica se há saldo suficiente, subtrai o valor e regrava o arquivo JSON. Se o valor estiver vazio ou for maior que o saldo, reinicia o saque. |

### Validações existentes

- Nome de conta já existente ao criar uma conta nova.
- Conta inexistente ao depositar, sacar ou consultar saldo.
- Valor vazio em depósitos e saques.
- Saldo insuficiente em saques.
- Opção de cancelar a operação digitando `cancelar` (ou `Cancelar`) nas perguntas de nome da conta.

## Estrutura do projeto

```
.
├── index.js        # código principal da aplicação
├── accounts/       # criada automaticamente, guarda um JSON por conta
├── package.json
└── README.md
```

## Limitações conhecidas e melhorias futuras

- Não há validação de valores não numéricos ou negativos nos depósitos e saques.
- Não há senha ou autenticação: qualquer pessoa que souber o nome da conta acessa o saldo.
- O nome da conta é usado direto no caminho do arquivo, o que permite nomes problemáticos (por exemplo, com `/`).
- O saldo é guardado como número de ponto flutuante, o que pode gerar imprecisão em valores decimais.
- Ideias: histórico de transações, transferência entre contas, validação com `validate` do inquirer e uso de `fs.promises`.

## Autor

Feito por Pedro como projeto de estudo de Node.js.
