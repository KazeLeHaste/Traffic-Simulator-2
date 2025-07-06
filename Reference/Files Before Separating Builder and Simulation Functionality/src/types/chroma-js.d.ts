declare module 'chroma-js' {
  interface ChromaStatic {
    (color: string | number | number[], mode?: string): Chroma;
    (a: number, b: number, c: number, mode?: string): Chroma;
    (color: string, lightness: number, saturation: number, mode: string): Chroma;
  }

  interface Chroma {
    hex(): string;
    rgb(): number[];
    hsl(): number[];
    hsv(): number[];
    lab(): number[];
    luminance(): number;
    alpha(): number;
    alpha(a: number): Chroma;
    brighten(amount?: number): Chroma;
    darken(amount?: number): Chroma;
    saturate(amount?: number): Chroma;
    desaturate(amount?: number): Chroma;
    set(mode: string, value: number): Chroma;
    get(mode: string): number;
  }

  const chroma: ChromaStatic;
  export = chroma;
}
