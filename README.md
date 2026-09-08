This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
or http://192.168.1.4:3000/

> ⚠️ **IMPORTANTE — Como testar o GPS no `npm run dev`:**
> 
> 
> A Geolocation API **só funciona em contexto seguro** (HTTPS). O projeto já vem configurado com `--experimental-https` no script `dev`, que gera um certificado SSL local automaticamente.
> 
> Na **primeira vez**, o Next.js vai pedir sua senha para instalar o certificado. Aceite e pronto!

Para testar no celular na mesma rede Wi-Fi, a melhor opção é fazer o deploy na Vercel 

### Deploy na Vercel (para testar no celular)

1. Suba o projeto no **GitHub**
2. Acesse vercel.com e faça login com o GitHub
3. Clique em "New Project" e selecione o repositório
4. Clique em "Deploy"
5. Pronto! Você terá uma URL `https://seu-projeto.vercel.app`

Agora abra essa URL no celular e teste o GPS ao ar livre! 


link: https://prof-joserui.notion.site/SIG-04-GPS-Next-js-PWA-3cc6c041c22a805f9cfef1bacbf1bc79
Diogo Santos