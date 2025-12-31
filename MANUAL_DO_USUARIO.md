# Manual do Usuário - Modern House Sistema PDV

## Índice
1. [Introdução](#introdução)
2. [Primeiro Acesso](#primeiro-acesso)
3. [Dashboard](#dashboard)
4. [Ponto de Venda (PDV)](#ponto-de-venda-pdv)
5. [Gestão de Produtos](#gestão-de-produtos)
6. [Fornecedores](#fornecedores)
7. [Notas Fiscais](#notas-fiscais)
8. [Relatórios](#relatórios)
9. [Vendedores](#vendedores)
10. [Alertas de Estoque](#alertas-de-estoque)
11. [Configurações](#configurações)

---

## Introdução

O **Modern House Sistema PDV** é uma solução completa para gestão de vendas e estoque, desenvolvida especialmente para a Modern House. O sistema oferece controle total sobre produtos, vendas, estoque, fornecedores e relatórios gerenciais.

### Principais Funcionalidades

- **Ponto de Venda (PDV)** com leitura de código de barras
- **Gestão de Estoque** com alertas automáticos
- **Entrada de Notas Fiscais** com atualização automática de estoque
- **Emissão de Cupom Não Fiscal**
- **Relatórios Detalhados** de vendas por período
- **Controle de Vendedores** com identificação por código
- **Integração com Stripe** para pagamentos com cartão

---

## Primeiro Acesso

### Login no Sistema

1. Acesse o sistema através do link fornecido
2. Faça login com sua conta Manus
3. Após o primeiro login, você será automaticamente cadastrado no sistema

### Configuração Inicial (Apenas Administrador)

Antes de começar a usar o sistema, configure as informações da loja:

1. Acesse **Configurações** no menu lateral
2. Preencha os dados da empresa:
   - Razão Social / Nome da Empresa
   - CNPJ ou CPF
   - Endereço Completo
   - Telefone (opcional)
   - E-mail (opcional)
3. Clique em **Salvar Configurações**

Essas informações serão utilizadas na emissão dos cupons não fiscais.

---

## Dashboard

O Dashboard é a página inicial do sistema e apresenta uma visão geral das operações:

### Indicadores Principais

- **Produtos Cadastrados**: Total de produtos no sistema
- **Vendas Hoje**: Quantidade de vendas realizadas no dia
- **Receita Hoje**: Valor total das vendas do dia
- **Estoque Baixo**: Produtos que atingiram o estoque mínimo (apenas admin)

### Informações Adicionais

- **Produtos com Estoque Baixo**: Lista dos 5 produtos com menor estoque
- **Últimas Vendas**: Histórico das 5 vendas mais recentes

---

## Ponto de Venda (PDV)

O PDV é o coração do sistema, onde as vendas são realizadas.

### Como Realizar uma Venda

#### 1. Adicionar Produtos ao Carrinho

Existem três formas de adicionar produtos:

**a) Código de Barras**
- Escaneie o código de barras com um leitor
- Ou digite o código manualmente e pressione Enter
- O produto será adicionado automaticamente ao carrinho

**b) Busca por Código**
- Digite o código do produto no campo de busca
- Selecione o produto da lista que aparecer

**c) Busca por Nome**
- Digite o nome do produto no campo de busca
- Selecione o produto desejado da lista

#### 2. Ajustar Quantidades

- Use os botões **+** e **-** para ajustar a quantidade de cada item
- Ou clique no ícone da lixeira para remover o item

#### 3. Identificar o Vendedor

- Digite seu código de vendedor no campo correspondente
- O sistema validará e exibirá seu nome

#### 4. Selecionar Forma de Pagamento

Escolha entre:
- **Espécie**: Informe o valor recebido para cálculo automático do troco
- **Débito**: Pagamento via cartão de débito
- **Crédito**: Pagamento via cartão de crédito

#### 5. Finalizar a Venda

- Clique em **Finalizar Venda**
- O sistema processará a venda e atualizará o estoque automaticamente
- Você será redirecionado para a página do cupom não fiscal

### Cupom Não Fiscal

Após finalizar a venda, o cupom será exibido automaticamente com:

- Informações da loja (razão social, CNPJ, endereço)
- Código único da venda (formato: DDMMAAAA-XXXXXX)
- Data e hora da venda
- Lista completa de produtos vendidos
- Forma de pagamento
- Valor total, valor recebido e troco (se aplicável)

**Opções do Cupom:**
- **Imprimir**: Imprime o cupom em impressora comum ou térmica
- **Baixar PDF**: Salva o cupom em formato PDF
- **Voltar ao PDV**: Retorna à tela de vendas

---

## Gestão de Produtos

### Cadastrar Novo Produto

1. Acesse **Produtos** no menu lateral
2. Clique em **Novo Produto**
3. Preencha as informações:
   - **Nome do Produto** (obrigatório)
   - **Descrição** (opcional)
   - **Código de Barras** (deixe vazio para gerar automaticamente)
   - **Preço Unitário** (obrigatório)
   - **Quantidade em Estoque** (obrigatório)
   - **Estoque Mínimo** (padrão: 10 unidades)
   - **Marca** (opcional)
   - **Categoria** (opcional)
4. Clique em **Cadastrar**

### Buscar Produtos

Use o campo de busca para encontrar produtos por:
- Nome do produto
- Código de barras

### Visualizar Estoque

A listagem de produtos mostra:
- Nome e código de barras
- Preço unitário
- Quantidade em estoque
- Produtos com estoque baixo aparecem em vermelho

---

## Fornecedores

### Cadastrar Fornecedor

1. Acesse **Fornecedores** no menu lateral
2. Clique em **Novo Fornecedor**
3. Preencha os dados:
   - **Nome do Fornecedor** (obrigatório)
   - **CNPJ ou CPF** (opcional)
   - **Telefone** (opcional)
   - **E-mail** (opcional)
   - **Endereço** (opcional)
4. Clique em **Cadastrar**

---

## Notas Fiscais

### Registrar Entrada de Nota Fiscal

1. Acesse **Notas Fiscais** no menu lateral
2. Clique em **Nova Nota Fiscal**
3. Preencha os dados da nota:
   - **Número da Nota** (obrigatório)
   - **Fornecedor** (obrigatório)
   - **Data de Entrada** (obrigatório)

#### Adicionar Itens à Nota

1. Selecione o **Produto**
2. Informe a **Quantidade**
3. Informe o **Custo Unitário**
4. Clique em **Adicionar**
5. Repita para cada item da nota

#### Finalizar Registro

- Revise os itens adicionados
- Confira o valor total
- Clique em **Registrar Nota**

**Importante:** O estoque dos produtos será atualizado automaticamente com as quantidades da nota fiscal.

---

## Relatórios

### Acessar Relatórios de Vendas

1. Acesse **Relatórios** no menu lateral
2. Selecione o período desejado:
   - **Hoje**: Vendas do dia atual
   - **Últimos 7 dias**: Vendas da última semana
   - **Último mês**: Vendas dos últimos 30 dias
   - **Último ano**: Vendas dos últimos 12 meses
   - **Personalizado**: Defina data inicial e final

### Informações Disponíveis

**Indicadores Gerais:**
- Total de vendas no período
- Receita total
- Ticket médio

**Vendas por Forma de Pagamento:**
- Quantidade e valor por método (espécie, débito, crédito)
- Percentual de cada forma de pagamento

**Desempenho por Vendedor:**
- Quantidade de vendas por vendedor
- Valor total vendido por vendedor
- Ranking de vendedores

**Histórico de Vendas:**
- Lista detalhada de todas as vendas do período
- Código da venda, data/hora, vendedor, valor e forma de pagamento

---

## Vendedores

### Gerenciar Vendedores (Apenas Administrador)

1. Acesse **Vendedores** no menu lateral
2. Visualize a lista de todos os usuários do sistema

### Configurar Código do Vendedor

1. Localize o vendedor na lista
2. Digite o código desejado no campo **Código do Vendedor**
3. Clique no ícone de salvar

**Importante:** Cada vendedor precisa de um código único para ser identificado nas vendas.

### Alterar Função do Usuário

1. Localize o usuário na lista
2. No campo **Função**, selecione:
   - **Vendedor**: Acesso ao PDV e dashboard
   - **Administrador**: Acesso completo ao sistema
3. A alteração é aplicada imediatamente

---

## Alertas de Estoque

### Visualizar Alertas

1. Acesse **Alertas** no menu lateral
2. Visualize a lista de produtos com estoque baixo

### Informações do Alerta

Cada alerta mostra:
- Nome do produto
- Código de barras
- Quantidade atual em estoque
- Quantidade mínima configurada
- Data e hora do alerta

### Marcar Alerta como Enviado

Após tomar as providências necessárias (fazer pedido, entrar em contato com fornecedor):

1. Clique em **Marcar como Enviado**
2. O alerta será removido da lista de pendentes

**Sistema de Notificações:**
O sistema gera alertas automaticamente quando um produto atinge o estoque mínimo durante uma venda.

---

## Configurações

### Atualizar Informações da Loja

1. Acesse **Configurações** no menu lateral
2. Edite as informações conforme necessário:
   - Razão Social / Nome da Empresa
   - CNPJ ou CPF
   - Endereço Completo
   - Telefone
   - E-mail
3. Clique em **Salvar Configurações**

**Importante:** Essas informações são exibidas nos cupons não fiscais emitidos pelo sistema.

---

## Dicas e Boas Práticas

### Para Vendedores

1. **Sempre identifique-se** com seu código antes de finalizar vendas
2. **Confira os produtos** adicionados ao carrinho antes de finalizar
3. **Verifique o troco** calculado em pagamentos em espécie
4. **Imprima ou mostre o cupom** ao cliente após cada venda

### Para Administradores

1. **Configure o sistema** antes de começar a usar
2. **Cadastre fornecedores** antes de registrar notas fiscais
3. **Defina códigos únicos** para cada vendedor
4. **Monitore os alertas** de estoque regularmente
5. **Revise os relatórios** periodicamente para análise de desempenho
6. **Mantenha o estoque mínimo** configurado adequadamente para cada produto

---

## Suporte Técnico

Para dúvidas, problemas ou sugestões:

- **Sistema**: Modern House PDV v1.0.0
- **Suporte**: https://help.manus.im

---

## Atalhos do Teclado

### No PDV
- **Enter**: Adicionar produto por código de barras
- **Tab**: Navegar entre campos

### Geral
- **Ctrl + P**: Imprimir (na página de cupom)

---

**Última atualização:** Dezembro 2025
**Versão do Manual:** 1.0.0
