export interface Child { id: string; name: string; age: string }
export interface Layer { level: number; title: string; subtitle: string; quote: string; note: string; nextQ?: string }
export interface GenerateResult { layers: Layer[]; parentTip: string; misinfoTip: string }
export const MAX_FREE_USES = 3
