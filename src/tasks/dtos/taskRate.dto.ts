import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsInt, Min, Max } from 'class-validator';

export class RateTaskDto {
  @ApiProperty({ minimum: 1, maximum: 10 })
  @Expose()
  @IsInt()
  @Min(1)
  @Max(10)
  rating: number;
}