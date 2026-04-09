# Como configurar Google Login

## Problema: Google login não funciona

### ✅ Checklist (verificar TUDO):

## 1. Vercel - Variáveis de Ambiente

Ir para: https://vercel.com/seu-projeto/settings/environment-variables

Adicionar:
```
VITE_API_URL = https://sigo-com-fe-api.onrender.com
VITE_CLOUDINARY_CLOUD_NAME = degxiuf43
VITE_CLOUDINARY_UPLOAD_PRESET = sigo_com_fe
```

**IMPORTANTE:** Depois de adicionar, fazer REDEPLOY do projeto no Vercel!

---

## 2. Firebase Console - Domínios Autorizados

Ir para: https://console.firebase.google.com/project/sigo-com-fe/authentication/settings

Em **"Authorized domains"**, adicionar:
- `sigo-com-fe.vercel.app` (ou o domínio atual do Vercel)
- `localhost` (para desenvolvimento)

---

## 3. Verificar se o backend está rodando

Testar: https://sigo-com-fe-api.onrender.com/api/auth/social

Deve responder com erro (porque não tem body), mas NÃO pode dar 404 ou timeout.

---

## 4. Testar no navegador

1. Abrir: https://sigo-com-fe.vercel.app
2. Abrir **Console** (F12)
3. Clicar em "Entrar com Google"
4. Ver os logs:
   - `🔧 AuthContext configurado:` → Deve mostrar API_BASE correto
   - `🔵 loginWithGoogle iniciado` → Login iniciou
   - `🔵 Redirect iniciado` → Vai redirecionar para Google
   - Depois de autorizar no Google, volta para o site
   - `🔵 Verificando redirect result...` → Deve processar o retorno
   - `✅ User do Google recebido:` → Sucesso!

---

## 5. Erros comuns

### "Erro ao sincronizar com servidor"
→ VITE_API_URL não está configurado no Vercel OU backend está offline

### "Unauthorized domain"
→ Domínio não está autorizado no Firebase Console

### Página recarrega mas não faz login
→ Abrir console e ver o erro exato nos logs

---

## Como testar localmente

```bash
cd frontend
# Criar arquivo .env.local:
echo "VITE_API_URL=https://sigo-com-fe-api.onrender.com" > .env.local
echo "VITE_CLOUDINARY_CLOUD_NAME=degxiuf43" >> .env.local
echo "VITE_CLOUDINARY_UPLOAD_PRESET=sigo_com_fe" >> .env.local

npm run dev
```

Abrir http://localhost:5173 e testar.
