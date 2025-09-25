/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENROUTER_API_KEY: string;
  // ajoutez d'autres variables d'environnement ici si nécessaire
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}