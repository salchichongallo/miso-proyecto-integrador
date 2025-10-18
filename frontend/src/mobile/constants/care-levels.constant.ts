export interface CareLevel {
  value: number;
  roman: string;
}

export const CARE_LEVELS: CareLevel[] = [
  { value: 1, roman: 'I' },
  { value: 2, roman: 'II' },
  { value: 3, roman: 'III' },
  { value: 4, roman: 'IV' },
];
