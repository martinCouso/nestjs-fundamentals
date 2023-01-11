import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Flavor } from './entities/flavor.entity';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Event } from '../events/entities/event.entity';
import { ConfigType } from '@nestjs/config';
import coffeesConfig from './coffees.config';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>,
    private readonly dataSource: DataSource,
    @Inject(coffeesConfig.KEY)
    private coffeesConfiguration: ConfigType<typeof coffeesConfig>,
  ) {
    const defaultCoffee = coffeesConfiguration.defaultCoffee;
    console.log('defaultCoffee', defaultCoffee);
  }

  findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return this.coffeeRepository.find({
      relations: { flavors: true },
      skip: offset,
      take: limit,
    });
  }

  async findOne(id: string) {
    const coffee = await this.coffeeRepository.findOne({
      where: { id: parseInt(id) },
      relations: {
        flavors: true,
      },
    });
    if (!coffee) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    return coffee;
  }

  async create(createCoffeeDto: CreateCoffeeDto) {
    const retrievedFlavors = await Promise.all(
      createCoffeeDto.flavors.map((flavorName) =>
        this.preloadFlavorByName(flavorName),
      ),
    );

    const newCoffee = this.coffeeRepository.create({
      ...createCoffeeDto,
      flavors: retrievedFlavors,
    });

    await this.coffeeRepository.save(newCoffee);
    return newCoffee;
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    console.log('id', id);

    const retrievedFlavors = await Promise.all(
      updateCoffeeDto.flavors.map((flavorName) =>
        this.preloadFlavorByName(flavorName),
      ),
    );
    const coffeeToUpdate = await this.coffeeRepository.preload({
      id: parseInt(id),
      ...updateCoffeeDto,
      flavors: retrievedFlavors,
    });
    if (!coffeeToUpdate) {
      throw new NotFoundException(`Coffee #${id} not found`);
    }
    return this.coffeeRepository.save(coffeeToUpdate);
  }

  async remove(id: string) {
    const coffee = await this.findOne(id);
    return this.coffeeRepository.remove(coffee);
  }

  private async preloadFlavorByName(name: string): Promise<Flavor> {
    const existingFlavor = await this.flavorRepository.findOne({
      where: { name: name },
    });
    if (existingFlavor) {
      return existingFlavor;
    }
    return this.flavorRepository.create({ name });
  }

  async recommendCoffee(coffee: Coffee) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      coffee.recommendations++;

      const recommendEvent = new Event();
      recommendEvent.name = 'recommend_coffee';
      recommendEvent.type = 'coffee';
      recommendEvent.payload = { coffeeId: coffee.id };

      await queryRunner.manager.save(coffee);
      await queryRunner.manager.save(recommendEvent);

      await queryRunner.commitTransaction();
      return coffee;
    } catch (err) {
      console.log('err', err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
