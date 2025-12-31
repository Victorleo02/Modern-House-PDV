# Modern House - Sistema PDV - TODO

## Autenticação e Usuários
- [x] Sistema de login com senha para vendedores e administradores
- [x] Gestão de roles (admin/vendedor)
- [x] Cadastro de vendedores com código único
- [x] Perfil de usuário

## Cadastro de Produtos
- [x] Formulário de cadastro de produtos
- [x] Campos: descrição, valor unitário, quantidade em estoque
- [x] Geração automática de código de barras
- [x] Listagem de produtos com busca e filtros
- [x] Edição e exclusão de produtos

## Entrada de Notas Fiscais
- [x] Formulário de entrada de nota fiscal
- [x] Campos: data de entrada, fornecedor, valor unitário de compra, quantidade, marca
- [x] Atualização automática do estoque ao registrar nota
- [x] Histórico de entradas de notas

## Sistema de Vendas (PDV)
- [x] Interface de PDV com três formas de seleção de produto
- [x] Leitura de código de barras via scanner ou câmera
- [x] Busca por código do produto
- [x] Busca por nome do produto
- [x] Identificação de vendedor por código
- [x] Carrinho de compras com lista de produtos
- [x] Cálculo automático do total
- [x] Seleção de forma de pagamento (débito, crédito, espécie)
- [x] Cálculo de troco para pagamento em espécie
- [x] Finalização da venda

## Integração Stripe
- [x] Configuração do Stripe
- [x] Processamento de pagamentos com cartão de débito
- [x] Processamento de pagamentos com cartão de crédito
- [x] Preparação para integração futura com maquininha

## Emissão de Cupom Não Fiscal
- [x] Geração de código de venda formatado (dia/mês/ano)
- [x] Cupom com informações da loja (razão social, CNPJ/CPF, endereço)
- [x] Cupom com data e hora da venda
- [x] Lista completa de produtos vendidos
- [x] Visualização do cupom na tela
- [x] Geração de PDF do cupom para impressão

## Relatórios Administrativos
- [x] Relatório de vendas diário
- [x] Relatório de vendas mensal
- [x] Relatório de vendas anual
- [x] Identificação de vendedor nos relatórios
- [x] Valores totais por período
- [x] Gráficos de desempenho

## Dashboard Administrativo
- [x] Visão geral de estoque
- [x] Visão geral de vendas
- [x] Desempenho de vendedores
- [x] Estatísticas em tempo real

## Controle de Estoque
- [x] Atualização automática após vendas
- [x] Atualização automática após entrada de notas
- [x] Configuração de quantidade mínima por produto
- [x] Sistema de alertas de estoque baixo
- [x] Envio de email ao administrador quando estoque atingir mínimo

## Design e UI
- [x] Aplicar estética minimalista escandinava
- [x] Fundo cinza claro frio com espaço negativo
- [x] Tipografia sans-serif preta em negrito
- [x] Formas geométricas abstratas em azul pastel e rosa blush
- [x] Layout corporativo e profissional
- [x] Responsividade para diferentes dispositivos

## Testes e Documentação
- [x] Testes unitários para funcionalidades críticas
- [x] Documentação de uso do sistema
- [x] Instruções de deploy
- [x] Manual do usuário

## Bugs Reportados
- [x] Corrigir erro de aninhamento de tags <a> no componente de navegação

## Novas Funcionalidades Solicitadas
- [x] Adicionar Pix como forma de pagamento com QR Code
- [x] Integrar geração de QR Code para pagamentos Pix
- [ ] Criar guia de deploy para servidor próprio
- [ ] Documentar opções de hospedagem gratuita

## Deploy em Progresso
- [ ] Criar tabelas no Railway
- [ ] Configurar variáveis de ambiente no Railway
- [ ] Conectar repositório GitHub ao Railway
- [ ] Fazer primeiro deploy
- [ ] Testar sistema em produção
