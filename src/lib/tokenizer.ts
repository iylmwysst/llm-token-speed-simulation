import { Tiktoken } from 'js-tiktoken/lite';

export type Encoder = {
  encode: (text: string) => number[];
  decode: (ids: number[]) => string;
  decodeOne: (id: number) => string;
};

let cached: Encoder | null = null;

export async function getEncoder(): Promise<Encoder> {
  if (cached) return cached;
  const { default: o200k_base } = await import('js-tiktoken/ranks/o200k_base');
  const tk = new Tiktoken(o200k_base);

  cached = {
    encode: (text) => tk.encode(text),
    decode: (ids) => tk.decode(ids),
    decodeOne: (id) => tk.decode([id]),
  };

  return cached;
}
