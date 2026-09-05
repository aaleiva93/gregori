# PadelPro

**Tu juego de pádel, a otro nivel.** Landing page de la app que encuentra rivales de tu nivel, reserva pistas en un clic y te ayuda a mejorar con estadísticas y ELO.

> Live: [aaleiva93.github.io/gregori](https://aaleiva93.github.io/gregori/)

---

## Qué hay dentro

Una landing en español, en una sola página, con un toque festivo que la hace difícil de aburrir:

- **Hero con pista de pádel animada** — el dibujo del court se traza sólo y el teléfono flota con una app en miniatura.
- **Minijuego "Peloteo" jugable dentro del teléfono** — señala, desliza o usa el teclado (flechas / A-D) para mover la pala y mantener el peloteo. Cada devolución acelera la bola, y tu récord se guarda en el navegador.
- **Navegación a pantalla completa en escritorio** — cada sección ocupa toda la vista y las transiciones se entremezclan con crossfade; en móvil el scroll es el de siempre.
- Contadores animados, reveal por scroll, FAQ desplegable, menú móvil y soporte completo de `prefers-reduced-motion`.

## Stack

Sin frameworks. HTML + CSS + JavaScript vanilla, tipografías de Google Fonts (Barlow / Barlow Condensed), y cero dependencias. Todo en 3 archivos:

```
├── index.html
├── styles.css
└── script.js
```

## Cómo correrlo en local

Abre `index.html` en el navegador (también puedes usar cualquier servidor estático):

```sh
# con Python
python -m http.server
# con Node
npx serve .
```

## Deploy

El push a `main` dispara GitHub Actions (`.github/workflows/pages.yml`), que publica la página en GitHub Pages automáticamente.

---

© 2026 PadelPro. Hecho para Gregori.