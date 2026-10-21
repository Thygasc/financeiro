# Documentação do Projeto: Gerenciador Financeiro Pessoal e para Freelancers

## 1. Visão Geral e Ideia Central do Projeto

O **Gerenciador Financeiro Pessoal e para Freelancers** é uma aplicação web responsiva projetada para proporcionar controle completo, clareza e agilidade na gestão de finanças pessoais e de pequenos negócios/freelancers.

### Objetivos do Sistema:
- **Rastreamento de Lançamentos:** Registro rápido de receitas e despesas com categorização e controle de status (pago/pendente).
- **Gestão de Cartões de Crédito e Compras Parceladas:** Acompanhamento detalhado do impacto de parcelamentos em faturas futuras, calculando automaticamente a extensão e o término das parcelas.
- **Orçamento por Categoria:** Definição de metas e limites mensais de gastos para evitar estouros de orçamento.
- **Visualização e Relatórios:** Dashboard intuitivo com gráficos e resumo de saldos, além de exportação de dados para relatórios.

---

## 2. Levantamento de Requisitos

### 2.1. Requisitos Funcionais (RF)

| ID | Descrição | Prioridade |
| :--- | :--- | :--- |
| **RF01** | O usuário deve poder se cadastrar e realizar login no sistema. | Alta |
| **RF02** | O sistema deve permitir a gestão (CRUD) de receitas e despesas com: valor, data, descrição, categoria, cartão e status (`PAGO` / `PENDENTE`). | Alta |
| **RF03** | O sistema deve permitir a criação, edição e exclusão de categorias personalizadas (ex: "Alimentação", "Transporte", "Salário") com identificador de tipo (`RECEITA`/`DESPESA`) e cor personalizada. | Alta |
| **RF04** | O usuário deve poder cadastrar e gerenciar cartões de crédito, definindo nome, limite total, dia de fechamento da fatura e dia de vencimento. | Alta |
| **RF05** | O sistema deve permitir o registro de compras parceladas no cartão de crédito, calculando automaticamente as datas de início e fim das parcelas na fatura. | Alta |
| **RF06** | O usuário deve poder definir limites de gastos mensais (orçamentos) por categoria para meses/anos específicos. | Média |
| **RF07** | O sistema deve disponibilizar um Dashboard interativo apresentando: saldo atual, total de receitas, total de despesas, gráfico por categoria e faturas dos cartões. | Alta |
| **RF08** | O sistema deve permitir a exportação dos dados de lançamentos e faturas para arquivo CSV. | Baixa |
| **RF09** | A arquitetura e a estrutura do projeto devem ser projetadas para serem hospedadas e executadas em camadas/serviços de nível gratuito (Free Tier) na nuvem, como Vercel (Frontend/Serverless) e Supabase (Banco de Dados PostgreSQL e Autenticação/Serviços). | Alta |

### 2.2. Requisitos Não Funcionais (RNF)

| ID | Descrição | Prioridade |
| :--- | :--- | :--- |
| **RNF01** | **Interface Responsiva:** A aplicação deve ser desenvolvida utilizando o conceito *Mobile First*, garantindo usabilidade ideal em telas móbiles e desktops. | Alta |
| **RNF02** | **Segurança e Criptografia:** As senhas dos usuários devem ser armazenadas utilizando hash criptográfico forte (ex: bcrypt ou Argon2). | Alta |
| **RNF03** | **Desempenho:** O tempo de resposta das consultas principais do Dashboard não deve ultrapassar 2 segundos para até 10.000 registros por usuário. | Média |
| **RNF04** | **Integridade de Dados:** O sistema deve utilizar banco de dados relacional com integridade referencial rigorosa e precisão decimal exata para valores monetários. | Alta |

---

## 3. Tecnologias Recomendadas e Arquitetura

O sistema adota uma arquitetura *decoupled* (separação total entre Frontend e Backend/Banco), permitindo deploy gratuito e escalável.

| Camada | Tecnologia Recomendada | Alternativa |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) / Next.js + TailwindCSS | Vue.js + TailwindCSS |
| **Backend** | Node.js (Express / NestJS) ou Supabase Edge Functions | Python (FastAPI / Django) |
| **Banco de Dados** | PostgreSQL (Hospedado no Supabase / Railway) | PostgreSQL |
| **ORM / Query Builder** | Prisma ORM / Drizzle ORM | SQLAlchemy |
| **Hospedagem Frontend** | Vercel (Gratuito) | Netlify / Cloudflare Pages |
| **Hospedagem Backend / BD**| Supabase (Gratuito) / Render | Railway |

---

## 4. Modelagem do Banco de Dados PostgreSQL

O banco de dados utiliza convenção de nomes em português, IDs em formato UUID e prefixo com iniciais de cada tabela nas colunas para evitar ambiguidades em junções.

### 4.1. Tabela `usuarios` (Prefix: `usu_`)
Armazena dados de conta e autenticação dos usuários.

```sql
CREATE TABLE usuarios (
    usu_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usu_nome VARCHAR(100) NOT NULL,
    usu_email VARCHAR(255) NOT NULL UNIQUE,
    usu_senha_hash VARCHAR(255) NOT NULL,
    usu_data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Coluna | Tipo de Dado | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `usu_id` | UUID | Primary Key | Identificador único do usuário. |
| `usu_nome` | VARCHAR(100) | Not Null | Nome do usuário. |
| `usu_email` | VARCHAR(255) | Not Null, Unique | E-mail para login. |
| `usu_senha_hash` | VARCHAR(255) | Not Null | Hash da senha. |
| `usu_data_criacao` | TIMESTAMP | Default: NOW() | Data de cadastro. |

---

### 4.2. Tabela `cartoes` (Prefix: `car_`)
Gerencia os cartões de crédito cadastrados.

```sql
CREATE TABLE cartoes (
    car_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_usu_id UUID NOT NULL REFERENCES usuarios(usu_id) ON DELETE CASCADE,
    car_nome VARCHAR(50) NOT NULL,
    car_limite DECIMAL(12,2) NOT NULL,
    car_dia_fechamento INTEGER NOT NULL,
    car_dia_vencimento INTEGER NOT NULL,
    car_data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Coluna | Tipo de Dado | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `car_id` | UUID | Primary Key | Identificador único do cartão. |
| `car_usu_id` | UUID | Foreign Key (`usuarios.usu_id`), Not Null | Dono do cartão. |
| `car_nome` | VARCHAR(50) | Not Null | Nome do cartão (ex: "Nubank"). |
| `car_limite` | DECIMAL(12,2) | Not Null | Limite total de crédito. |
| `car_dia_fechamento` | INTEGER | Not Null | Dia do fechamento da fatura (1-31). |
| `car_dia_vencimento` | INTEGER | Not Null | Dia do vencimento da fatura (1-31). |
| `car_data_criacao` | TIMESTAMP | Default: NOW() | Data de criação. |

---

### 4.3. Tabela `categorias` (Prefix: `cat_`)
Classificação personalizada de receitas e despesas.

```sql
CREATE TABLE categorias (
    cat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cat_usu_id UUID NOT NULL REFERENCES usuarios(usu_id) ON DELETE CASCADE,
    cat_nome VARCHAR(50) NOT NULL,
    cat_tipo VARCHAR(20) NOT NULL,
    cat_cor VARCHAR(7),
    cat_data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Coluna | Tipo de Dado | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `cat_id` | UUID | Primary Key | Identificador da categoria. |
| `cat_usu_id` | UUID | Foreign Key (`usuarios.usu_id`), Not Null | Dono da categoria. |
| `cat_nome` | VARCHAR(50) | Not Null | Nome da categoria. |
| `cat_tipo` | VARCHAR(20) | Not Null | `RECEITA` ou `DESPESA`. |
| `cat_cor` | VARCHAR(7) | Opcional | Código HEX da cor. |
| `cat_data_criacao` | TIMESTAMP | Default: NOW() | Data de criação. |

---

### 4.4. Tabela `compras_parceladas` (Prefix: `cpa_`)
Registro mestre de contratos de compras divididas em parcelas.

```sql
CREATE TABLE compras_parceladas (
    cpa_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cpa_usu_id UUID NOT NULL REFERENCES usuarios(usu_id) ON DELETE CASCADE,
    cpa_car_id UUID NOT NULL REFERENCES cartoes(car_id) ON DELETE CASCADE,
    cpa_cat_id UUID REFERENCES categorias(cat_id) ON DELETE SET NULL,
    cpa_descricao VARCHAR(255) NOT NULL,
    cpa_valor_total DECIMAL(12,2) NOT NULL,
    cpa_valor_parcela DECIMAL(12,2) NOT NULL,
    cpa_total_parcelas INTEGER NOT NULL,
    cpa_data_compra DATE NOT NULL,
    cpa_mes_inicio_fatura INTEGER NOT NULL,
    cpa_ano_inicio_fatura INTEGER NOT NULL,
    cpa_mes_fim_fatura INTEGER NOT NULL,
    cpa_ano_fim_fatura INTEGER NOT NULL,
    cpa_data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Coluna | Tipo de Dado | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `cpa_id` | UUID | Primary Key | Identificador da compra parcelada. |
| `cpa_usu_id` | UUID | Foreign Key (`usuarios.usu_id`), Not Null | Usuário comprador. |
| `cpa_car_id` | UUID | Foreign Key (`cartoes.car_id`), Not Null | Cartão utilizado. |
| `cpa_cat_id` | UUID | Foreign Key (`categorias.cat_id`), Opcional | Categoria associada. |
| `cpa_descricao` | VARCHAR(255) | Not Null | Descrição do item parcelado. |
| `cpa_valor_total` | DECIMAL(12,2) | Not Null | Valor total somado. |
| `cpa_valor_parcela` | DECIMAL(12,2) | Not Null | Valor de cada parcela. |
| `cpa_total_parcelas` | INTEGER | Not Null | Número total de parcelas. |
| `cpa_data_compra` | DATE | Not Null | Data da compra. |
| `cpa_mes_inicio_fatura` | INTEGER | Not Null | Mês da 1ª parcela na fatura. |
| `cpa_ano_inicio_fatura` | INTEGER | Not Null | Ano da 1ª parcela na fatura. |
| `cpa_mes_fim_fatura` | INTEGER | Not Null | Mês da última parcela na fatura. |
| `cpa_ano_fim_fatura` | INTEGER | Not Null | Ano da última parcela na fatura. |
| `cpa_data_criacao` | TIMESTAMP | Default: NOW() | Registro no banco. |

---

### 4.5. Tabela `transacoes` (Prefix: `tra_`)
Registros individuais de receitas, despesas à vista ou parcelas individuais geradas.

```sql
CREATE TABLE transacoes (
    tra_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tra_usu_id UUID NOT NULL REFERENCES usuarios(usu_id) ON DELETE CASCADE,
    tra_cat_id UUID REFERENCES categorias(cat_id) ON DELETE SET NULL,
    tra_car_id UUID REFERENCES cartoes(car_id) ON DELETE SET NULL,
    tra_cpa_id UUID REFERENCES compras_parceladas(cpa_id) ON DELETE CASCADE,
    tra_valor DECIMAL(12,2) NOT NULL,
    tra_tipo VARCHAR(20) NOT NULL,
    tra_descricao VARCHAR(255) NOT NULL,
    tra_data DATE NOT NULL,
    tra_status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    tra_numero_parcela INTEGER,
    tra_data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Coluna | Tipo de Dado | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `tra_id` | UUID | Primary Key | Identificador do lançamento. |
| `tra_usu_id` | UUID | Foreign Key (`usuarios.usu_id`), Not Null | Usuário dono. |
| `tra_cat_id` | UUID | Foreign Key (`categorias.cat_id`), Opcional | Categoria da transação. |
| `tra_car_id` | UUID | Foreign Key (`cartoes.car_id`), Opcional | Cartão associado (se houver). |
| `tra_cpa_id` | UUID | Foreign Key (`compras_parceladas.cpa_id`), Opcional | Compra parcelada pai (se for parcela). |
| `tra_valor` | DECIMAL(12,2) | Not Null | Valor do lançamento. |
| `tra_tipo` | VARCHAR(20) | Not Null | `RECEITA` ou `DESPESA`. |
| `tra_descricao` | VARCHAR(255) | Not Null | Descrição do lançamento. |
| `tra_data` | DATE | Not Null | Data do vencimento/lançamento. |
| `tra_status` | VARCHAR(20) | Not Null, Default: 'PENDENTE' | `PAGO` ou `PENDENTE`. |
| `tra_numero_parcela` | INTEGER | Opcional | Número da parcela atual (ex: 3). |
| `tra_data_criacao` | TIMESTAMP | Default: NOW() | Registro no banco. |

---

### 4.6. Tabela `orcamentos` (Prefix: `orc_`)
Definição de limites mensais por categoria.

```sql
CREATE TABLE orcamentos (
    orc_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orc_usu_id UUID NOT NULL REFERENCES usuarios(usu_id) ON DELETE CASCADE,
    orc_cat_id UUID NOT NULL REFERENCES categorias(cat_id) ON DELETE CASCADE,
    orc_valor_limite DECIMAL(12,2) NOT NULL,
    orc_mes INTEGER NOT NULL,
    orc_ano INTEGER NOT NULL,
    orc_data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

| Coluna | Tipo de Dado | Restrições | Descrição |
| :--- | :--- | :--- | :--- |
| `orc_id` | UUID | Primary Key | Identificador do orçamento. |
| `orc_usu_id` | UUID | Foreign Key (`usuarios.usu_id`), Not Null | Usuário dono. |
| `orc_cat_id` | UUID | Foreign Key (`categorias.cat_id`), Not Null | Categoria limitada. |
| `orc_valor_limite` | DECIMAL(12,2) | Not Null | Teto máximo definido. |
| `orc_mes` | INTEGER | Not Null | Mês de referência (1-12). |
| `orc_ano` | INTEGER | Not Null | Ano de referência (ex: 2026). |

---

## 5. Planejamento do Roteiro de Execução

Para desenvolver este projeto manualmente sem perder o foco ou se sobrecarregar, siga a ordem estrita de etapas abaixo:

1. **Etapa 1: Modelagem e Criação do Banco de Dados**
   - Configuração do projeto no Supabase / PostgreSQL.
   - Execução dos scripts SQL DDL para criação das tabelas e relacionamentos.
   - Configuração de políticas RLS (Row Level Security) se usar Supabase.

2. **Etapa 2: Mapeamento e Desenvolvimento do Backend (API)**
   - Configuração da estrutura do projeto Backend.
   - Implementação do módulo de Autenticação (JWT / Hash de senha).
   - Criação dos endpoints CRUD para Usuários, Categorias, Cartões, Compras Parceladas, Transações e Orçamentos.
   - Teste das rotas via Postman / Insomnia / Bruno.

3. **Etapa 3: Construção da Interface (Frontend Estático com Mocks)**
   - Criação do layout base e telas responsivas utilizando React/Next e TailwindCSS.
   - Construção dos componentes: Formulários de cadastro/login, tabelas de listagem, cartões de resumo e Dashboard com dados simulados.

4. **Etapa 4: Integração Frontend e Backend**
   - Conexão do frontend com as rotas reais da API.
   - Tratamento de telas de carregamento (*loading*), validações de formulário e mensagens de erro.

5. **Etapa 5: Deploy e Hospedagem na Nuvem (Free Tier)**
   - Deploy do banco de dados no Supabase / Railway.
   - Deploy do backend e variáveis de ambiente.
   - Deploy do frontend na Vercel conectado à API de produção.
