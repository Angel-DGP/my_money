export class SpendingByCategoryDto {
  category_id!: string;
  category_name!: string;
  category_icon!: string | null;
  amount!: number;
  currency!: string;
  percentage!: number;
}

export class CashFlowDto {
  month!: string;
  income!: number;
  expense!: number;
  currency!: string;
}

export class AnalyticsResponseDto {
  spending_by_category!: SpendingByCategoryDto[];
  cash_flow!: CashFlowDto[];
}
