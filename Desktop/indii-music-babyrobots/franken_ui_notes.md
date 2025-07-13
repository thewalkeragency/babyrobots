# 🧩 Franken UI Integration Guide

> Designing modern, reactive, and modular UIs with Franken UI in place of ShadCN for Indii.Music and similar AI-native app frontends.

---

## ✅ WHY FRANKEN UI?

Franken UI is a component-driven design system focused on composability, accessibility, and modern DX (developer experience), offering an alternative to more opinionated libraries like ShadCN.

### 🚀 Advantages Over ShadCN:

- **No dependency lock-in:** Works with Tailwind, Vanilla Extract, and more.
- **Headless & Extensible:** Choose your logic/UI separation style.
- **Accessible & Unstyled by default:** More flexibility for AI-generated design patterns.
- **Framer Motion & Radix ready:** Great for animation and popovers.

---

## 📦 INSTALLATION

```bash
npm install @franken-ui/react @franken-ui/tailwind framer-motion class-variance-authority
```

---

## 🧱 STRUCTURE EXAMPLE

```tsx
// app/components/ui/button.tsx
import { cva } from 'class-variance-authority';

export const button = cva(
  'inline-flex items-center justify-center font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-black text-white',
        outline: 'border border-gray-300 text-black bg-white',
      },
      size: {
        sm: 'px-3 py-1 text-sm',
        md: 'px-4 py-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);
```

---

## 🧠 USAGE PATTERNS

### ✅ DO:

- Extract logic and style separately for component clarity
- Co-locate your variant files
- Use `cva()` for all major variants
- Write AI-friendly class structure (token-aware, reusable)
- Reuse primitives in generated components

### ❌ DON'T:

- Embed hardcoded Tailwind values in business logic
- Use Franken UI if you're locked into ShadCN ecosystem without escape plan

---

## 🧪 EXAMPLE: HERO COMPONENT

```tsx
import { button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section className="text-center space-y-4">
      <h1 className="text-4xl font-bold">Indii.Music is here</h1>
      <p className="text-lg text-gray-500">Powerful tools for independent artists</p>
      <button className={button({ variant: 'default', size: 'md' })}>
        Get Started
      </button>
    </section>
  );
}
```

---

## 🔧 SCALING STRATEGY

- Build an `@/components/ui` folder of AI-ready primitives
- Use `variant.ts` and `theme.ts` to maintain tokens
- Write wrapper components for interactive elements
- Automate component generation with prompts per page layout

---

## 📁 FILE STRUCTURE SUGGESTION

```
src/
├── components/
│   └── ui/
│       ├── button.tsx
│       ├── input.tsx
│       ├── modal.tsx
│       └── card.tsx
├── pages/
│   └── index.tsx
└── styles/
    └── globals.css
```

---

## 🔮 FUTURE-READY NOTES

- Franken UI is ideal for AI-driven, atomic UI generation.
- Works well in edge-deployed React environments.
- Integrates seamlessly with agent-designed component libraries.

> Store this in `docs/frontend/franken-ui.md` and use it to drive agent decisions when composing frontend elements.

