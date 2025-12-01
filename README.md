# @packages/prisma-client

Легковесный Prisma Client wrapper для NestJS с паттерном Singleton и удобной интеграцией для работы с PostgreSQL базой данных.

## 📋 Содержание

- [Возможности](#-возможности)
- [Требования](#-требования)
- [Установка](#-установка)
- [Структура пакета](#-структура-пакета)
- [Быстрый старт](#-быстрый-старт)
- [Использование модулей и сервисов](#-использование-модулей-и-сервисов)
- [API Reference](#-api-reference)
- [Типы и интерфейсы](#-типы-и-интерфейсы)
- [Troubleshooting](#-troubleshooting)
- [Тестирование](#-тестирование)

## 🚀 Возможности

- ✅ **Singleton pattern** - единый экземпляр Prisma Client для всего приложения
- ✅ **NestJS интеграция** - глобальный модуль с поддержкой `forRootAsync`
- ✅ **Type-safe API** - полная типобезопасность TypeScript
- ✅ **Generic типы** - поддержка кастомных Prisma Client экземпляров
- ✅ **100% покрытие тестами** - надежность и качество кода
- ✅ **Graceful shutdown** - корректное отключение при остановке приложения
- ✅ **Гибкая конфигурация** - использование фабрики для создания клиента

## 📋 Требования

- **Node.js**: >= 22.11.0
- **NestJS**: >= 11.0.0
- **Prisma**: >= 6.0.0
- **PostgreSQL**: >= 12.0.0

## 📦 Установка

```bash
npm install @packages/prisma-client
```

### Зависимости

Пакет требует следующие peer dependencies:

```json
{
  "@nestjs/common": "^11.0.0",
  "@prisma/client": "^6.0.0",
  "reflect-metadata": "^0.1.13 || ^0.2.0"
}
```

## 📁 Структура пакета

```
src/
├── main/                                   # Основная логика
│   ├── prisma.module.ts                    # PrismaModule - глобальный NestJS модуль
│   └── prisma.service.ts                   # PrismaService - Singleton сервис
│
├── types/                                  # TypeScript типы и интерфейсы
│   ├── module-options.interface.ts         # Опции конфигурации модуля
│   └── prisma-client.interface.ts          # Интерфейс PrismaClientLike
│
├── utils/                                  # Утилиты
│   └── injection-keys.ts                   # DI токены
│
├── errors/                                 # Кастомные ошибки
│   └── prisma.error.ts                     # PrismaClientError
│
└── index.ts                                # Точка входа (экспорты)
```

## 🔧 Быстрый старт

### Шаг 1: Создайте Prisma Client

Сначала создайте свой Prisma Client согласно документации Prisma. Например:

```typescript
// src/prisma/client.ts
import { PrismaClient as GeneratedPrismaClient } from '@prisma/client';

export const prismaClient = new GeneratedPrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
```

### Шаг 2: Создайте конфигурацию

```typescript
// src/configs/database.config.ts
import { registerAs } from '@nestjs/config';
import type { PrismaClientModuleOptions } from '@packages/prisma-client';
import { prismaClient } from '../prisma/client';

export default registerAs(
  'database',
  (): PrismaClientModuleOptions => ({
    clientFactory: () => prismaClient,
  }),
);
```

### Шаг 3: Импортируйте модуль в AppModule

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '@packages/prisma-client';
import databaseConfig from './configs/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig],
      isGlobal: true,
    }),
    PrismaModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => configService.get('database')!,
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### Шаг 4: Используйте PrismaService в сервисах

```typescript
// user.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@packages/prisma-client';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService<PrismaClient>) {}

  async findAll() {
    return await this.prisma.client.user.findMany();
  }

  async findById(id: string) {
    return await this.prisma.client.user.findUnique({
      where: { id },
    });
  }

  async create(data: { name: string; email: string }) {
    return await this.prisma.client.user.create({ data });
  }
}
```

**Готово!** Модуль автоматически:
- Подключится к базе данных при старте
- Создаст единое подключение для всего приложения
- Отключится при shutdown

## 📚 Использование модулей и сервисов

### PrismaModule

**Назначение:** Глобальный модуль для единого подключения к Prisma Client.

**Метод инициализации:**

#### `forRootAsync(options)`

```typescript
PrismaModule.forRootAsync({
  useFactory: (configService: ConfigService) => ({
    clientFactory: () => prismaClient,
  }),
  inject: [ConfigService],
  imports: [ConfigModule],
})
```

**Параметры:**
- `useFactory: (deps) => PrismaClientModuleOptions` - фабрика для создания опций модуля
- `inject?: InjectionToken[]` - зависимости для инжекции в useFactory
- `imports?: Module[]` - дополнительные модули для DI

**Экспортирует:** `PrismaService`

### PrismaService

**Методы:**

#### `get client(): TClient`

Получить экземпляр Prisma Client.

```typescript
const users = await prismaService.client.user.findMany();
```

**Возвращает:**
- `TClient` - экземпляр Prisma Client
- Выбрасывает `PrismaClientError`, если клиент не инициализирован

#### `disconnect(): Promise<void>`

Отключиться от базы данных (вызывается автоматически при shutdown).

```typescript
await prismaService.disconnect();
```

### `PrismaClientError`

Кастомная ошибка Prisma Client.

```typescript
import { PrismaClientError } from '@packages/prisma-client';

try {
  await prismaService.client.user.findMany();
} catch (error) {
  if (error instanceof PrismaClientError) {
    const originalError = error.getOriginalError();
  }
}
```

**Особенности:**
- Сохраняет stack trace оригинальной ошибки
- Предоставляет доступ к оригинальной ошибке через `getOriginalError()`

## 🔧 Настройка переменных окружения

Добавьте в `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/database?schema=public"
```

## 🎯 Типы и интерфейсы

### PrismaClientModuleOptions

Опции конфигурации для Prisma модуля.

```typescript
interface PrismaClientModuleOptions<TClient extends PrismaClientLike = PrismaClientLike> {
  /** Фабрика для создания экземпляра PrismaClient */
  clientFactory: () => TClient;
}
```

### PrismaClientModuleAsyncOptions

Асинхронные опции для динамической конфигурации модуля.

```typescript
interface PrismaClientModuleAsyncOptions<
  T extends unknown[] = [],
  TClient extends PrismaClientLike = PrismaClientLike,
> {
  /** Фабрика для создания опций */
  useFactory: (...args: T) => Promise<PrismaClientModuleOptions<TClient>> | PrismaClientModuleOptions<TClient>;
  /** Зависимости для инжекции в useFactory */
  inject?: (InjectionToken | OptionalFactoryDependency)[];
  /** Дополнительные модули для DI */
  imports?: Module[];
}
```

### PrismaClientLike

Интерфейс для Prisma Client (используется для generic типов).

```typescript
interface PrismaClientLike {
  $disconnect: () => Promise<void>;
}
```

## 📖 Примеры использования

### Базовое использование

```typescript
@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService<PrismaClient>) {}

  async findAll() {
    return await this.prisma.client.user.findMany();
  }

  async findById(id: string) {
    return await this.prisma.client.user.findUnique({
      where: { id },
    });
  }
}
```

### Использование с кастомным Prisma Client

```typescript
// Определите свой Prisma Client
class CustomPrismaClient extends PrismaClient {
  // Кастомные методы
  async customMethod() {
    // ...
  }
}

// Используйте в конфигурации
PrismaModule.forRootAsync({
  useFactory: () => ({
    clientFactory: () => new CustomPrismaClient(),
  }),
})

// Используйте в сервисе
@Injectable()
export class CustomService {
  constructor(private readonly prisma: PrismaService<CustomPrismaClient>) {}
  
  async useCustomMethod() {
    await this.prisma.client.customMethod();
  }
}
```

### Работа с транзакциями

```typescript
@Injectable()
export class TransactionService {
  constructor(private readonly prisma: PrismaService<PrismaClient>) {}

  async createWithTransaction() {
    return await this.prisma.client.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name: 'John', email: 'john@example.com' },
      });

      await tx.post.create({
        data: { title: 'Post', userId: user.id },
      });

      return user;
    });
  }
}
```

## 🧪 Тестирование

Пакет имеет **100% покрытие тестами**.

```bash
# Запустить тесты
npm test

# Запустить тесты с покрытием
npm run test:coverage

# Watch режим
npm run test:watch
```

## 🚨 Troubleshooting

### Prisma Client не инициализирован

**Проблема:** `Prisma Client не инициализирован`

**Решение:**
1. Убедитесь, что `PrismaModule` импортирован в `AppModule`
2. Проверьте, что `onModuleInit()` был вызван (происходит автоматически)
3. Проверьте порядок импорта модулей
4. Убедитесь, что `clientFactory` возвращает валидный Prisma Client

### Ошибка подключения к БД

**Проблема:** Не удается подключиться к базе данных

**Решение:**
1. Проверьте переменные окружения (`DATABASE_URL`)
2. Убедитесь, что PostgreSQL запущен
3. Проверьте логи приложения
4. Проверьте сетевые настройки (firewall, Docker network)

### Проблемы с generic типами

**Проблема:** TypeScript ошибки при использовании generic типов

**Решение:**
1. Убедитесь, что передаете правильный тип в `PrismaService<YourPrismaClient>`
2. Проверьте, что ваш Prisma Client реализует интерфейс `PrismaClientLike`
3. Используйте явное указание типа при инжекции

### Проблемы с производительностью

**Проблема:** Медленные запросы к БД

**Решение:**
1. Используйте connection pooling (реализовано автоматически через Prisma)
2. Проверьте индексы в базе данных
3. Используйте `select` для получения только нужных полей
4. Оптимизируйте запросы (избегайте N+1 проблем)

## 🔑 Особенности реализации

### Singleton Pattern

Prisma Service использует паттерн Singleton для создания единого экземпляра подключения:

```typescript
private prismaClient: TClient | null = null;

async onModuleInit(): Promise<void> {
  if (!this.prismaClient) {
    this.prismaClient = this.options.clientFactory();
  }
}
```

**Преимущества:**
- Экономия ресурсов (одно подключение вместо множества)
- Автоматический connection pooling через Prisma
- Безопасное переиспользование в разных модулях

### Graceful Shutdown

Модуль автоматически закрывает подключение при остановке приложения:

```typescript
async onModuleDestroy(): Promise<void> {
  await this.disconnect();
}
```

### Generic типы

Сервис поддерживает generic типы для работы с кастомными Prisma Client экземплярами:

```typescript
PrismaService<CustomPrismaClient>
```

### Обработка ошибок

Кастомная ошибка `PrismaClientError`:
- Сохраняет stack trace оригинальной ошибки
- Предоставляет доступ к оригинальной ошибке через `getOriginalError()`

## 📄 Лицензия

MIT License

## 👥 Автор

Skryabin Aleksey
