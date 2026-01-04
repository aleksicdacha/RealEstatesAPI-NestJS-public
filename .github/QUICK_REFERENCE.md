# Best Practices Quick Reference

## 🚦 Quick Decisions

| Situation | Do This | Not This |
|-----------|---------|----------|
| **Logging** | `this.logger.log('message')` | `console.log('message')` |
| **Error - Not Found** | `throw new NotFoundException('msg')` | `throw new Error('msg')` |
| **Error - Bad Input** | `throw new BadRequestException('msg')` | `throw error` |
| **Public Route** | `@Public()` on method | Comment out `@UseGuards()` |
| **Get User** | Return without password | Return full user object |
| **DB Transaction** | Use `manager.transaction()` | Multiple separate saves |
| **DTO Validation** | `@IsNotEmpty()`, `@IsNumber()` | Manual if checks |
| **Pagination** | Max 100 items, default 20 | Unlimited results |
| **Password Hashing** | `bcrypt.hash(pwd, 10)` | `bcrypt.hash(pwd, salt)` with genSalt |

---

## 🎨 Code Templates

### Service with Logger
```typescript
import { Injectable, Logger, NotFoundException } from '@nestjs/common';

@Injectable()
export class MyService {
  private readonly logger = new Logger(MyService.name);

  async findOne(id: string) {
    this.logger.debug(`Finding item: ${id}`);
    
    try {
      const item = await this.repository.findOne({ where: { id } });
      if (!item) {
        throw new NotFoundException(`Item ${id} not found`);
      }
      return item;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Failed to find item: ${id}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve item');
    }
  }
}
```

### Controller with Auth
```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@src/auth/guards/jwt-auth.guard';
import { Public } from '@src/common/decorators/public.decorator';

@Controller('items')
@UseGuards(JwtAuthGuard)  // All routes need auth by default
export class ItemController {
  @Get('public')
  @Public()  // Except this one
  findPublic() {}

  @Post()
  @Roles(Role.ADMIN)  // Admin only
  create() {}
}
```

### DTO with Validation
```typescript
import { IsNotEmpty, IsNumber, Min, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateItemDto {
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsNumber({}, { message: 'Price must be a number' })
  @Min(0, { message: 'Price cannot be negative' })
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsEnum(ItemType, { message: 'Invalid item type' })
  type?: ItemType;
}
```

### Transaction Example
```typescript
async createWithRelations(dto: CreateDto) {
  return await this.dataSource.manager.transaction(async (manager) => {
    const item = manager.create(Item, dto);
    await manager.save(item);
    
    const relations = dto.relations.map(r => 
      manager.create(Relation, { item, ...r })
    );
    await manager.save(relations);
    
    return item;
  });
}
```

---

## 📋 Common HTTP Exceptions

```typescript
import {
  NotFoundException,        // 404 - Resource not found
  BadRequestException,      // 400 - Invalid input
  UnauthorizedException,    // 401 - Not authenticated
  ForbiddenException,       // 403 - Not authorized
  ConflictException,        // 409 - Duplicate/conflict
  InternalServerErrorException, // 500 - Server error
} from '@nestjs/common';

// Usage
throw new NotFoundException('User not found');
throw new BadRequestException('Invalid email format');
throw new ConflictException('Email already exists');
```

---

## 🔐 Security Checklist

- [ ] Auth guards enabled on all admin routes
- [ ] `@Public()` decorator on truly public routes
- [ ] Passwords never returned in responses
- [ ] Input validation on all DTOs
- [ ] Rate limiting on auth endpoints
- [ ] `synchronize: false` in production
- [ ] JWT secrets are 32+ characters
- [ ] CORS configured properly
- [ ] Sensitive data in `.env`, not code

---

## 🐛 Debugging Tips

```typescript
// Debug level logging (only in development)
this.logger.debug('Detailed info', { data });

// Log level logging (important events)
this.logger.log('User created', { userId });

// Warning level (recoverable issues)
this.logger.warn('Failed attempt', { attempt });

// Error level (with stack trace)
this.logger.error('Operation failed', error.stack);
```

---

## ⚡ Performance Tips

```typescript
// ✅ Select only needed fields
await this.repository.find({
  select: ['id', 'name', 'email'],
});

// ✅ Use pagination
await this.repository.find({
  take: Math.min(limit, 100),
  skip: (page - 1) * limit,
});

// ✅ Use indexes (in migration)
@Index(['email', 'status'])

// ✅ Cache frequent queries
cache: {
  id: 'query-key',
  milliseconds: 60000,
}

// ❌ Avoid N+1 queries
// Use relations: { user: true } instead of loading separately
```

---

## 🧪 Testing Quick Start

```typescript
describe('ItemService', () => {
  let service: ItemService;
  let repository: MockType<Repository<Item>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ItemService,
        {
          provide: getRepositoryToken(Item),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(ItemService);
    repository = module.get(getRepositoryToken(Item));
  });

  it('should find an item', async () => {
    const mockItem = { id: '1', name: 'Test' };
    repository.findOne.mockResolvedValue(mockItem);

    const result = await service.findOne('1');
    expect(result).toEqual(mockItem);
  });
});
```

---

## 📦 Installation Commands

```bash
# Validation
npm install class-validator class-transformer

# Swagger
npm install @nestjs/swagger

# Config validation
npm install joi

# Testing
npm install --save-dev @nestjs/testing

# Env
cp apps/api/.env.example apps/api/.env
```

---

## 🚀 Daily Workflow

1. **Before coding:** Check if route needs auth
2. **While coding:** Use Logger, not console
3. **After coding:** Add validation to DTOs
4. **Before commit:** Run `./scripts/find-console-logs.sh`
5. **Before deploy:** Check `.env` has all vars

---

## 📞 Need Help?

- **Best Practices Guide:** `.github/BEST_PRACTICES_IMPROVEMENTS.md`
- **Implementation Guide:** `.github/IMPLEMENTATION_GUIDE.md`
- **Example Service:** `apps/api/src/entities/user/user.service.best-practice.example.ts`
- **NestJS Docs:** https://docs.nestjs.com
