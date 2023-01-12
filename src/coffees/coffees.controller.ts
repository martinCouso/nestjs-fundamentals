import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Public } from '../common/decorators/public.decorator';
import { ParseIntPipe } from '../common/pipes/parse-int/parse-int.pipe';
import { ProtocolDecorator } from '../common/decorators/protocol.decorator';
import {
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('coffees')
@Controller('coffees')
export class CoffeesController {
  constructor(private readonly coffeesService: CoffeesService) {}

  @Get()
  @Public()
  async findAll(
    @ProtocolDecorator('https') protocol,
    @Query() paginationQuery,
  ) {
    //await new Promise((resolve) => setTimeout(resolve, 4000));
    console.log('protocol', protocol);
    return this.coffeesService.findAll(paginationQuery);
  }

  @ApiInternalServerErrorResponse({ description: 'Server Error' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: string) {
    console.log('id', id);
    return this.coffeesService.findOne(id);
  }

  @Post()
  create(@Body() createCoffeeDto: CreateCoffeeDto) {
    return this.coffeesService.create(createCoffeeDto);
  }

  @Patch(':id/recommend')
  async recommendCoffee(@Param('id') id: string) {
    const coffeeToRecommend = await this.coffeesService.findOne(id);
    return this.coffeesService.recommendCoffee(coffeeToRecommend);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCoffeeDto: UpdateCoffeeDto) {
    return this.coffeesService.update(id, updateCoffeeDto);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coffeesService.remove(id);
  }
}
