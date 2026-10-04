# 🏥 Saúde na Palma da Mão - API Backend

API RESTful desenvolvida com Node.js e Express para gerenciamento e agendamento de consultas médicas, clínicas e triagens de pacientes.

---

## 🚀 Tecnologias Utilizadas

- **Node.js**: Ambiente de execução do código JavaScript no servidor.
- **Express**: Framework web para criação e gerenciamento das rotas da API.
- **PostgreSQL (pg)**: Banco de dados relacional para persistência dos dados.
- **CORS**: Middleware para liberação de acesso entre origens diferentes.
- **bcrypt**: Criptografia e segurança de senhas de usuários.
- **dotenv**: Gerenciamento de variáveis de ambiente.

---

## 📁 Estrutura do Projeto

Saude-na-Palma-da-M-o---Senac/
├── controllers/          # Lógica de negócios da aplicação
├── middleware/           # Middlewares (autenticação, validação)
├── models/               # Modelos e regras de consulta ao banco de dados
├── routes/               # Definição dos endpoints e rotas da API
├── .gitignore            # Arquivos ignorados pelo Git
├── app.js                # Ponto de entrada (Entry point) do servidor Express
├── db.js                 # Configuração da conexão com o banco PostgreSQL
├── package.json          # Dependências e scripts do projeto
└── schema.sql            # Scripts de criação e estrutura das tabelas SQL

---

## ⚙️ Como Executar o Projeto Localmente

### Pré-requisitos
- **Node.js** instalado (versão 18 ou superior).
- Banco de dados **PostgreSQL** ativo e configurado.

### Passo a Passo

1. **Clonar o repositório:**
   git clone https://github.com/srenataoliveira/Saude-na-Palma-da-M-o---Senac.git
   cd Saude-na-Palma-da-M-o---Senac

2. **Instalar as dependências:**
   npm install

3. **Configurar as Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto contendo as credenciais de acesso ao seu banco de dados:
   PORT=3000
   DB_USER=seu_usuario
   DB_HOST=seu_host
   DB_NAME=nome_do_banco
   DB_PASSWORD=sua_senha
   DB_PORT=5432

4. **Inicializar o Banco de Dados:**
   Execute o script `schema.sql` no seu SGDB para criar as tabelas necessárias.

5. **Iniciar o Servidor:**
   node app.js
   O terminal exibirá a mensagem "Servidor rodando na porta 3000".

---

## 📌 Endpoints Principais (Rotas)

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| GET | /clinicas | Retorna a lista de todas as clínicas cadastradas. |
| GET | /triagens | Retorna o histórico e lista de triagens. |
| POST | /triagens | Cadastra uma nova triagem de paciente. |
| POST | /auth/login | Realiza a autenticação do usuário. |

---

## 👥 Autores

Desenvolvido por **Renata Oliveira** e **Gabriel Tenório** como parte do projeto acadêmico do Senac Pernambuco.