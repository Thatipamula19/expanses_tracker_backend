import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class DeleteTransactionDto {
    @ApiProperty({ description: 'Transaction ID' })
    @IsNotEmpty({ message: 'Transaction ID is required' })
    @IsString({ message: 'Transaction ID must be a string' })
    id: string;
}