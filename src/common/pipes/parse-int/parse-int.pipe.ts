import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform {
  transform(value: any) {
    const parsedNumber = parseInt(value, 10);
    if (isNaN(parsedNumber)) {
      throw new BadRequestException(
        `Validation Failed ${value} is not a valid number`,
      );
    }
    return parsedNumber;
  }
}
