# Mensaje amoriños en cualquier momento del día (Y2K)

App React (Vite + TypeScript + Tailwind) para MJ & Luis.
- PIN de acceso: **1309**
- Perfiles: MJ y Luis
- Mensajes con 4 categorías, reacciones y fotos
- Galería de portada
- Estilo Y2K con purpurina y recortes

## Scripts
```bash
npm install
npm run dev     # desarrollo
npm run build   # producción (carpeta dist/)
npm run preview # sirve dist/ localmente
```

## Despliegue rápido en Vercel (recomendado)
1) Crea una cuenta en https://vercel.com e instala Vercel CLI:
```bash
npm i -g vercel
```
2) En la carpeta del proyecto:
```bash
vercel
# contesta a las preguntas (Framework: Vite; Directorio build: dist)
```
3) Para builds posteriores:
```bash
vercel --prod
```

## Despliegue con Netlify
1) En https://app.netlify.com -> "Add new site" -> "Import an existing project".  
2) Build command: `npm run build`  
3) Publish directory: `dist`  
4) Node version: 18+

## GitHub Pages (opcional)
1) Sube el repo a GitHub.  
2) Añade el plugin `gh-pages` o usa GitHub Actions para publicar `dist/`.  
3) Asegúrate de usar rutas relativas (Vite ya sirve `/` correctamente).

## Notas
- Los datos se guardan en `localStorage` del navegador.
- Para resetear el PIN recordado, borra el item `amorinhos_pin_ok` de localStorage.
