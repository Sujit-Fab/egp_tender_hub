/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare module 'pdfjs-dist/build/pdf.worker.mjs?url' {
  const src: string;
  export default src;
}
