export interface MonthlyFlowDto {
  month: string; // 'YYYY-MM'
  income: number;
  expense: number;
  net: number;
  currency: string;
}

export interface MonthlyFlowResponseDto {
  current_month: MonthlyFlowDto[];
  previous_month: MonthlyFlowDto[];
}
