import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsPositive } from "class-validator";

export class PaginationQueryDto {
    @ApiProperty({ type: Number})
    @IsOptional()
    @IsPositive()
    limit: number = 10;

    @ApiProperty({ type: Number})
    @IsOptional()
    @IsPositive()
    page?:number = 1;
}