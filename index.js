
//modulos externos
const chalk = require('chalk')
const inquirer = require('inquirer')

//modulos internos
const fs = require('fs')

console.clear()

//Chamada da função principal: responsável pelo menu, e executa outras funções com base na escolha do usuário.
operation()

function operation() {
    console.clear()
    console.log(chalk.bgGreen('Accounts - Menu principal'))

    inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: chalk.blue('O que você deseja fazer?'),
        choices: [
            'Criar conta',
            'Depositar',
            'Consultar saldo',
            'Sacar',
            'Sair',
        ]
    }])
        //define qual função o programa executará com base na escolha do usuário.
        .then((answer) => {
            const action = answer['action']

            if (action == 'Criar conta') {
                createAccount()
            } else if (action == 'Depositar') {
                deposit()
            } else if (action == 'Consultar saldo') {
                getAccountBalance()
            } else if (action == 'Sacar') {
                withdraw()
            } else if (action == 'Sair') {
                console.clear()
                console.log(chalk.bgBlue.black('Obrigado por usar o Accounts!'))
                process.exit()
            }
        })
        .catch(err => console.log(err))
}

//Função para criar conta (opção 1)
function createAccount() {
    console.clear()
    console.log(chalk.bgGreen.black('Parabéns por escolher nosso banco!'))
    //chama a função responsável por criar a conta do usuário (que ficará em um arquivo JSON, dentro de um diretório de contas)
    buildAccount()
}

function buildAccount() {
    console.clear()
    console.log(chalk.bgBlue.black('Opção selecionada: Criar conta'))
    inquirer.prompt([
        {
            name: 'accountName',
            message: '*Digite "cancelar" caso queira cancelar esta operação.\nDigite um nome para a sua conta:'
        }
    ])
        .then((answer) => {
            const accountName = answer['accountName']

            //condicional para caso o usuário queira cancelar a operação digitando "cancelar" na resposta
            if (accountName == 'cancelar' || accountName == 'Cancelar') {
                console.clear()
                console.log(chalk.bgBlue.black('Operação cancelada com sucesso!'))
                return setTimeout(() => {
                    operation()
                }, 3000)
            }

            //verifica se existe o diretório "accounts" (pasta), e cria se não existir.
            if (!fs.existsSync('accounts')) {
                fs.mkdirSync('accounts')
            }

            //verifica se existe, dentro do diretório, um arquivo json com o nome da conta do usuário.
            //Se existir, ele não cria e reinicia a função de criar conta com uma mensagem de aviso para tentar outro nome.
            if (fs.existsSync(`accounts/${accountName}.json`)) {
                console.clear()
                console.log(chalk.bgRed.black('Esta conta já existe, escolha outro nome!'))
                return setTimeout(() => {
                    buildAccount()
                }, 3000)
            }

            //Se não existir, ele prossegue com a criação do arquivo json, que armazenará as informações do usuário.
            fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}', (err) => {
                console.log(err)
            })

            console.clear()
            console.log(chalk.green('Parabéns, a sua conta foi criada!'))

            //volta para o menu.
            return setTimeout(() => {
                operation()
            }, 3000)
        })
}

//Função para depositar valores (Opção 2)
function deposit() {
    console.clear()
    console.log(chalk.bgBlue.black('Opção selecionada: Depositar'))
    inquirer.prompt([
        {
            name: 'accountName',
            message: '*Digite "cancelar" caso queira cancelar esta operação.\nQual o nome da sua conta?'
        }
    ]).then((answer) => {
        const accountName = answer['accountName']

        //condicional para caso o usuário queira cancelar a operação digitando "cancelar" na resposta
        if (accountName == 'cancelar' || accountName == 'Cancelar') {
            console.clear()
            console.log(chalk.bgBlue.black('Operação cancelada com sucesso!'))
            return setTimeout(() => {
                return operation()
            }, 3000)
        }

        //executa uma função de checar conta (ela existe pelo fato de que tudo estará associado às contas, então precisa verificar se a conta existe).
        //recebe como parâmetro o nome da conta, e se não existir, mostra uma mensagem de aviso.
        //nessas condições, o if retorna a função deposit, reiniciando o processo de depósito.
        if (!checkAccount(accountName)) {
            return setTimeout(() => {
                deposit()
            }, 3000)
        }

        //Se existe, ele prossegue com o prompt para perguntar quanto que o usuário deseja depositar e definir o amount.
        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto você deseja depositar?'
            }
        ]).then((answer) => {
            const amount = answer['amount']

            //executa a função que será responsável por adicionar valores ao balance do usuário.
            addAmount(accountName, amount)
            //volta para o menu inicial.
            return setTimeout(() => {
                operation()
            }, 3000)

        }).catch((err) => { console.log(err) })


    }).catch((err) => { console.log(err) })
}

//verifica se o arquivo json da conta existe. Se não, ela exibe a mensagem de aviso e retorna false para que seja possível usar dentro de verificações com if.
function checkAccount(accountName) {
    if (!fs.existsSync(`accounts/${accountName}.json`)) {
        console.clear()
        console.log(chalk.bgRed.black('Esta conta não existe, escolha outro nome!'))
        return false
    }
    //Se existe, retorna true.
    return true
}

//Função para adicionar valor ao balance do usuário (recebe o nome da conta e a quantia definida a partir do prompt na função deposit).
//Exibe as informações.
function addAmount(accountName, amount) {
    const accountData = getAccount(accountName)

    //Verifica se o usuário especificou o valor a ser depositado, e caso não tenha, ele reinicia o processo com uma mensagem de erro.
    if (!amount) {
        console.clear()
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde'))
        return setTimeout(() => {
            deposit()
        }, 3000)
    }

    //redefine o valor da conta adicionando o amount ao balance do usuário.
    accountData.balance = parseFloat(accountData.balance) + parseFloat(amount)

    //Reescreve o arquivo JSON com o novo valor.
    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        (err) => {
            console.log(err)
        }
    )

    console.clear()
    console.log(chalk.green(`Foi depositado o valor de R$${amount} na sua conta!`))
}

//Função para ler um arquivo json específico de uma conta.
function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf-8',
        flag: 'r'
    })

    //Após isso, retorna as informações que estão dentro do arquivo.
    return JSON.parse(accountJSON)
}

//Exibe o valor da conta do usuário (Opção 3).
function getAccountBalance() {
    console.clear()
    console.log(chalk.bgBlue.black('Opção selecionada: Consultar Saldo'))
    inquirer.prompt([
        {
            name: 'accountName',
            message: '*Digite "cancelar" caso queira cancelar esta operação.\nQual o nome da sua conta?'
        }
    ]).then((answer) => {
        const accountName = answer['accountName']

        //condicional para caso o usuário queira cancelar a operação digitando "cancelar" na resposta
        if (accountName == 'cancelar' || accountName == 'Cancelar') {
            console.clear()
            console.log(chalk.bgBlue.black('Operação cancelada com sucesso!'))
            return setTimeout(() => {
                operation()
            }, 3000)
        }

        if (!checkAccount(accountName)) {
            return setTimeout(() => {
                getAccountBalance()
            }, 3000)
        }

        const accountData = getAccount(accountName)
        console.clear()
        console.log(chalk.bgBlue.black(`Olá, o saldo da sua conta é de R$${accountData.balance}!`))
        return setTimeout(() => {
            operation()
        }, 3000)
    }).catch((err) => { console.log(err) })
}

//Função para sacar um valor (Opção 4)
function withdraw() {
    console.clear()
    console.log(chalk.bgBlue.black('Opção selecionada: Sacar'))
    inquirer.prompt([
        {
            name: 'accountName',
            message: '*Digite "cancelar" caso queira cancelar esta operação.\nQual o nome da sua conta?'
        }
    ]).then((answer) => {
        const accountName = answer['accountName']

        //condicional para caso o usuário queira cancelar a operação digitando "cancelar" na resposta
        if (accountName == 'cancelar' || accountName == 'Cancelar') {
            console.clear()
            console.log(chalk.bgBlue.black('Operação cancelada com sucesso!'))
            return setTimeout(() => {
                operation()
            }, 3000)
        }

        //executa uma função de checar conta (ela existe pelo fato de que tudo estará associado às contas, então precisa verificar se a conta existe).
        //recebe como parâmetro o nome da conta, e se não existir, mostra uma mensagem de aviso.
        //nessas condições, o if retorna a função withdraw, reiniciando o processo de saque.
        if (!checkAccount(accountName)) {
            return setTimeout(() => {
                withdraw()
            }, 3000)
        }

        //Se existe, ele prossegue com o prompt para perguntar quanto que o usuário deseja depositar e definir o amount.
        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto você deseja sacar?'
            }
        ]).then((answer) => {
            const amount = answer['amount']

            //executa a função que será responsável por remover valores do balance do usuário.
            removeAmount(accountName, amount)
        }).catch((err) => { console.log(err) })

    }).catch((err) => { console.log(err) })
}


//Função para remover valores da conta do usuário (usada na função withdraw, opção 4)
function removeAmount(accountName, amount) {
    const accountData = getAccount(accountName)

    //Verifica se o usuário especificou o valor a ser sacado, e caso não tenha, ele reinicia o processo com uma mensagem de erro.
    if (!amount) {
        console.log('Você deve inserir um valor válido!')
        return setTimeout(() => {
            withdraw()
        }, 3000)
    }

    //Verifica se o usuário tem o valor que quer destacar disponível na conta.
    if (accountData.balance < amount) {
        console.log(chalk.bgRed.black('Valor indisponível!'))
        return setTimeout(() => {
            withdraw()
        }, 3000)
    }

    //redefine o valor da conta adicionando o amount ao balance do usuário.
    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

    //Reescreve o arquivo JSON com o novo valor.
    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        (err) => {
            console.log(err)
        }
    )

    console.clear()
    console.log(chalk.green(`Você realizou um saque de R$${amount}`))
    return setTimeout(() => {
        operation()
    }, 3000)
}
