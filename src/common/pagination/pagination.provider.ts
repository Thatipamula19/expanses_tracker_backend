import { Inject, Injectable } from '@nestjs/common';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { Paginated } from './paginater.interface';

@Injectable()
export class PaginationProvider {
  constructor(@Inject(REQUEST) private readonly request: Request) {}
  public async paginateQuery<T extends ObjectLiteral>(
    paginationQueryDto: PaginationQueryDto,
    repository: Repository<T>,
    relations?: FindOptionsRelations<T>,
    where?: FindOptionsWhere<T>,
    order?: FindOptionsOrder<T>,
  ): Promise<Paginated<T>> {
    const findOptions: FindManyOptions<T> = {
      skip: ((paginationQueryDto.page ?? 0) - 1) * paginationQueryDto.limit,
      take: paginationQueryDto.limit,
    };

    if (where) {
      findOptions.where = where;
    }

    if (relations) {
      findOptions.relations = relations;
    }

    if (order) {
      findOptions.order = order;
    }
    const result = await repository.find(findOptions);
    const totalItems = await repository.count(findOptions);
    const currentPage = Number(paginationQueryDto.page);
    const totalPages = Math.ceil(totalItems / paginationQueryDto.limit);
    const response: Paginated<T> = {
      data: result,
      meta: {
        itemPerPage: paginationQueryDto.limit,
        totalItems: totalItems,
        currentPage: currentPage,
        totalPages: totalPages,
      }
    };

    return response;
  }
}
