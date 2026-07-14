declare module 'highlight.js/lib/languages/*' {
  const language: any;
  export default language;
}

declare module 'lowlight' {
  export const createLowlight: any;
  export const common: any;
  export const all: any;
}
