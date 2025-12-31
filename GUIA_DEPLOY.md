# Guia Completo de Deploy - Modern House PDV

## Índice
1. [Requisitos do Servidor](#requisitos-do-servidor)
2. [Opções de Hospedagem Gratuita](#opções-de-hospedagem-gratuita)
3. [Deploy no Railway](#deploy-no-railway)
4. [Deploy no Render](#deploy-no-render)
5. [Deploy no Heroku](#deploy-no-heroku)
6. [Deploy em VPS Linux](#deploy-em-vps-linux)
7. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
8. [Variáveis de Ambiente](#variáveis-de-ambiente)
9. [Troubleshooting](#troubleshooting)

---

## Requisitos do Servidor

O sistema Modern House PDV requer:

- **Node.js**: v18 ou superior
- **npm/pnpm**: v8 ou superior
- **Banco de Dados**: MySQL 8.0+ ou TiDB
- **Espaço em Disco**: Mínimo 2GB
- **Memória RAM**: Mínimo 1GB (recomendado 2GB)
- **Processador**: 1 vCPU mínimo (recomendado 2 vCPU)

---

## Opções de Hospedagem Gratuita

### 1. **Railway** (Recomendado)
- **Créditos Grátis**: $5/mês
- **Banco de Dados**: PostgreSQL/MySQL grátis
- **Uptime**: 99.9%
- **Suporte**: Comunidade ativa
- **URL**: https://railway.app

### 2. **Render**
- **Créditos Grátis**: $7/mês
- **Banco de Dados**: PostgreSQL grátis
- **Uptime**: 99.9%
- **Suporte**: Documentação excelente
- **URL**: https://render.com

### 3. **Heroku** (Descontinuado - não recomendado)
- Heroku descontinuou seu plano gratuito em novembro de 2022

### 4. **Vercel** (Apenas Frontend)
- Ideal para frontend estático
- Não suporta backend Node.js em plano gratuito

### 5. **Replit**
- **Créditos Grátis**: Limitado
- **Banco de Dados**: Integração com Supabase
- **Uptime**: Hibernação após inatividade
- **URL**: https://replit.com

---

## Deploy no Railway

Railway é a opção **mais recomendada** para este projeto.

### Passo 1: Criar Conta no Railway

1. Acesse https://railway.app
2. Clique em "Sign Up"
3. Autentique com GitHub, Google ou email
4. Confirme seu email

### Passo 2: Conectar Repositório Git

1. Crie um repositório no GitHub com os arquivos do projeto
2. No Railway, clique em "New Project"
3. Selecione "Deploy from GitHub"
4. Autorize Railway a acessar seus repositórios
5. Selecione o repositório do Modern House PDV

### Passo 3: Configurar Banco de Dados

1. No painel do Railway, clique em "Add Service"
2. Selecione "MySQL"
3. Railway criará automaticamente um banco de dados
4. Copie a connection string (DATABASE_URL)

### Passo 4: Configurar Variáveis de Ambiente

1. No painel do projeto, vá para "Variables"
2. Adicione as seguintes variáveis:

```
NODE_ENV=production
DATABASE_URL=mysql://[user]:[password]@[host]:[port]/[database]
JWT_SECRET=[gere uma chave aleatória segura]
VITE_APP_ID=[seu app ID do Manus]
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
STRIPE_SECRET_KEY=[sua chave secreta do Stripe]
STRIPE_WEBHOOK_SECRET=[seu webhook secret do Stripe]
VITE_STRIPE_PUBLISHABLE_KEY=[sua chave pública do Stripe]
```

### Passo 5: Deploy Automático

1. Railway detectará automaticamente o `package.json`
2. Executará `pnpm install` e `pnpm build`
3. Iniciará o servidor com `pnpm start`
4. Seu aplicativo estará disponível em uma URL pública

### Passo 6: Configurar Domínio Customizado (Opcional)

1. No painel do Railway, vá para "Settings"
2. Clique em "Add Domain"
3. Escolha entre:
   - Domínio Railway gratuito (ex: seu-app.railway.app)
   - Seu próprio domínio (requer configuração DNS)

---

## Deploy no Render

### Passo 1: Criar Conta

1. Acesse https://render.com
2. Clique em "Sign Up"
3. Autentique com GitHub

### Passo 2: Criar Novo Serviço

1. Clique em "New +"
2. Selecione "Web Service"
3. Conecte seu repositório GitHub
4. Configure:
   - **Name**: modern-house-pdv
   - **Runtime**: Node
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`

### Passo 3: Configurar Banco de Dados

1. Clique em "New +"
2. Selecione "PostgreSQL"
3. Configure o banco de dados
4. Copie a connection string

### Passo 4: Adicionar Variáveis de Ambiente

1. No serviço web, vá para "Environment"
2. Adicione todas as variáveis listadas na seção Railway
3. Clique em "Save Changes"

### Passo 5: Deploy

Render fará deploy automaticamente quando você fizer push para o GitHub.

---

## Deploy em VPS Linux

Para maior controle, você pode fazer deploy em uma VPS (Virtual Private Server).

### Opções de VPS Gratuitas/Baratas

- **AWS EC2**: 12 meses grátis (tier gratuito)
- **Google Cloud**: $300 de créditos grátis
- **Azure**: $200 de créditos grátis
- **DigitalOcean**: $5-6/mês (droplet básico)
- **Linode**: $5/mês
- **Vultr**: $2.50/mês

### Passo 1: Provisionar VPS

Exemplo com DigitalOcean:

1. Crie uma conta em https://digitalocean.com
2. Clique em "Create" → "Droplets"
3. Selecione:
   - **Image**: Ubuntu 22.04 LTS
   - **Size**: Basic ($5/mês)
   - **Region**: Mais próximo de você
4. Clique em "Create Droplet"
5. Anote o IP da VPS

### Passo 2: Conectar via SSH

```bash
ssh root@[seu-ip-da-vps]
```

### Passo 3: Instalar Dependências

```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Instalar pnpm
npm install -g pnpm

# Instalar MySQL
apt install -y mysql-server

# Instalar Nginx (reverse proxy)
apt install -y nginx

# Instalar PM2 (gerenciador de processos)
npm install -g pm2
```

### Passo 4: Clonar Repositório

```bash
cd /home
git clone [seu-repositório-git] modern-house-pdv
cd modern-house-pdv
```

### Passo 5: Configurar Banco de Dados

```bash
# Iniciar MySQL
mysql -u root -p

# Criar banco de dados
CREATE DATABASE modern_house_pdv;
CREATE USER 'pdv_user'@'localhost' IDENTIFIED BY 'senha_segura';
GRANT ALL PRIVILEGES ON modern_house_pdv.* TO 'pdv_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Passo 6: Configurar Variáveis de Ambiente

```bash
cd /home/modern-house-pdv
nano .env.production
```

Adicione:

```
NODE_ENV=production
DATABASE_URL=mysql://pdv_user:senha_segura@localhost:3306/modern_house_pdv
JWT_SECRET=[gere uma chave aleatória]
# ... outras variáveis
```

### Passo 7: Instalar Dependências e Build

```bash
pnpm install
pnpm build
```

### Passo 8: Configurar PM2

```bash
pm2 start "pnpm start" --name "modern-house-pdv"
pm2 startup
pm2 save
```

### Passo 9: Configurar Nginx

```bash
nano /etc/nginx/sites-available/modern-house-pdv
```

Adicione:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ative o site:

```bash
ln -s /etc/nginx/sites-available/modern-house-pdv /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Passo 10: Configurar SSL (HTTPS)

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d seu-dominio.com
```

---

## Configuração do Banco de Dados

### Migração Automática

O sistema usa Drizzle ORM para migrações automáticas:

```bash
pnpm db:push
```

Isso criará todas as tabelas necessárias automaticamente.

### Backup do Banco de Dados

```bash
# Criar backup
mysqldump -u pdv_user -p modern_house_pdv > backup.sql

# Restaurar backup
mysql -u pdv_user -p modern_house_pdv < backup.sql
```

---

## Variáveis de Ambiente

### Variáveis Obrigatórias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `NODE_ENV` | Ambiente de execução | `production` |
| `DATABASE_URL` | Connection string do banco | `mysql://user:pass@host/db` |
| `JWT_SECRET` | Chave para assinar tokens | `sua-chave-segura-aqui` |
| `VITE_APP_ID` | ID da aplicação Manus | `seu-app-id` |
| `OAUTH_SERVER_URL` | URL do servidor OAuth | `https://api.manus.im` |

### Variáveis do Stripe

| Variável | Descrição |
|----------|-----------|
| `STRIPE_SECRET_KEY` | Chave secreta do Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secret do webhook do Stripe |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Chave pública do Stripe |

### Como Gerar JWT_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Troubleshooting

### Problema: "Cannot find module 'stripe'"

**Solução:**
```bash
pnpm install stripe
pnpm build
```

### Problema: "Connection refused" ao banco de dados

**Solução:**
1. Verifique se o banco está rodando: `systemctl status mysql`
2. Verifique DATABASE_URL em `.env`
3. Teste a conexão: `mysql -u user -p -h host`

### Problema: "Port 3000 already in use"

**Solução:**
```bash
# Encontre o processo usando a porta
lsof -i :3000

# Mate o processo
kill -9 [PID]

# Ou use outra porta
PORT=3001 pnpm start
```

### Problema: "Build fails with TypeScript errors"

**Solução:**
```bash
pnpm check
pnpm build --force
```

### Problema: "Stripe webhook not working"

**Solução:**
1. Verifique o STRIPE_WEBHOOK_SECRET
2. Configure o webhook no dashboard do Stripe
3. Use `stripe listen` localmente para testar

---

## Monitoramento em Produção

### Logs

```bash
# Railway
railway logs

# Render
render logs

# VPS com PM2
pm2 logs modern-house-pdv
```

### Métricas

Instale ferramentas de monitoramento:

- **New Relic**: Monitoramento de performance
- **Sentry**: Rastreamento de erros
- **Datadog**: Observabilidade completa

---

## Segurança

### Checklist de Segurança

- [ ] Use HTTPS (SSL/TLS)
- [ ] Configure firewall (UFW no Linux)
- [ ] Use senhas fortes para banco de dados
- [ ] Mantenha dependências atualizadas
- [ ] Configure rate limiting
- [ ] Use variáveis de ambiente para secrets
- [ ] Faça backups regulares
- [ ] Configure logs e monitoramento
- [ ] Revise permissões de arquivo

### Comandos de Segurança

```bash
# Atualizar dependências
pnpm update

# Verificar vulnerabilidades
pnpm audit

# Configurar firewall (VPS)
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

---

## Próximos Passos

1. **Escolha uma plataforma** (Railway recomendado)
2. **Configure o banco de dados**
3. **Adicione variáveis de ambiente**
4. **Faça o primeiro deploy**
5. **Configure domínio customizado**
6. **Configure SSL/HTTPS**
7. **Teste todas as funcionalidades**
8. **Configure backups automáticos**
9. **Implemente monitoramento**

---

## Suporte

Para dúvidas sobre deploy:

- **Railway Docs**: https://docs.railway.app
- **Render Docs**: https://render.com/docs
- **Node.js Docs**: https://nodejs.org/docs
- **Manus Support**: https://help.manus.im

---

**Última atualização:** Dezembro 2025
**Versão:** 1.0.0
