export interface Serie { id_categoria: number; categoria: string; valores: number[] }

export const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const rotuloMes = (anoMes: string) => `${anoMes.slice(5)}/${anoMes.slice(0, 4)}`;
