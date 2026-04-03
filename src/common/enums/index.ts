export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
}

export enum CategoryType {
  INCOME = 'income',
  EXPENSE = 'expense',
  BOTH = 'both',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum GoalStatus {
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  PAUSED = 'paused',
}


export enum DateRangePeriod {
    TODAY = 'today',
    THIS_WEEK = 'this_week',
    THIS_MONTH = 'this_month',
    LAST_MONTH = 'last_month',
    LAST_3_MONTHS = 'last_3_months',
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}