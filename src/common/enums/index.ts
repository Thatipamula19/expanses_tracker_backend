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

export enum OverviewPeriod {
  THIS_MONTH = '1',
  LAST_3_MONTHS = '3',
  LAST_6_MONTHS = '6',
  LAST_12_MONTHS = '12',
}

export enum GoalTimePeriod {
  THIS_MONTH = 'this_month',
  LAST_3_MONTHS = 'last_3_months',
  LAST_6_MONTHS = 'last_6_months',
  THIS_YEAR = 'this_year',
  ALL_TIME = 'all_time',
}
