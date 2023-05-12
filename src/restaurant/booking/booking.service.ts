import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTableResponse, Table } from './type';

@Injectable()
export class BookingService {
  private tableList: Table[] = [];

  initTable(amount: number): CreateTableResponse {
    if (this.tableList.length > 0) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          message: ['table already initialize'],
          error: 'Conflict',
        },
        HttpStatus.CONFLICT,
      );
    }
    for (let i = 1; i <= amount; i++) {
      this.tableList.push({
        id: i,
        name: `Table_${i}`,
        status: 'available',
      });
    }
    console.log(this.tableList);
    return { message: 'Initialize table success.' };
  }
}
