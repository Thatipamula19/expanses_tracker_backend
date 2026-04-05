export interface Paginated<T> {
  data: T[];
  meta: {
    itemPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
  };
  links: {
    first: string;
    last: string;
    current: string;
    previous: string;
    next: string;
  };
}
