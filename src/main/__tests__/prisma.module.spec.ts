import { Test } from "@nestjs/testing";
import PrismaModule from "src/main/prisma.module";
import PrismaService from "src/main/prisma.service";
import { PRISMA_CLIENT_OPTIONS } from "src/utils/injection-keys";

import type { TestingModule } from "@nestjs/testing";
import type {
	PrismaClientModuleOptions,
	PrismaClientModuleAsyncOptions,
} from "src/types/module-options.interface";
import type { PrismaClientLike } from "src/types/prisma-client.interface";

describe("PrismaModule", () => {
	let mockClient: MockPrismaClient;
	let mockOptions: PrismaClientModuleOptions<MockPrismaClient>;

	beforeEach(() => {
		mockClient = {
			$disconnect: jest.fn().mockResolvedValue(undefined),
		};

		mockOptions = {
			clientFactory: jest.fn().mockReturnValue(mockClient),
		};
	});

	describe("forRootAsync", () => {
		it("должен возвращать DynamicModule с правильной конфигурацией", () => {
			const asyncOptions: PrismaClientModuleAsyncOptions<[], MockPrismaClient> = {
				useFactory: jest.fn().mockResolvedValue(mockOptions),
			};

			const dynamicModule = PrismaModule.forRootAsync(asyncOptions);

			expect(dynamicModule).toBeDefined();
			expect(dynamicModule.module).toBe(PrismaModule);
			expect(dynamicModule.providers).toBeDefined();
			expect(dynamicModule.exports).toEqual([PrismaService]);
		});

		it("должен регистрировать PRISMA_CLIENT_OPTIONS провайдер", () => {
			const useFactory = jest.fn().mockResolvedValue(mockOptions);
			const asyncOptions: PrismaClientModuleAsyncOptions<[], MockPrismaClient> = {
				useFactory,
			};

			const dynamicModule = PrismaModule.forRootAsync(asyncOptions);

			expect(dynamicModule.providers).toBeDefined();
			const optionsProvider = dynamicModule.providers?.find(
				(provider) => (provider as { provide: symbol }).provide === PRISMA_CLIENT_OPTIONS
			);

			expect(optionsProvider).toBeDefined();
		});

		it("должен регистрировать PrismaService провайдер", () => {
			const asyncOptions: PrismaClientModuleAsyncOptions<[], MockPrismaClient> = {
				useFactory: jest.fn().mockResolvedValue(mockOptions),
			};

			const dynamicModule = PrismaModule.forRootAsync(asyncOptions);

			expect(dynamicModule.providers).toBeDefined();
			const serviceProvider = dynamicModule.providers?.find(
				(provider) => (provider as { provide: typeof PrismaService }).provide === PrismaService
			);

			expect(serviceProvider).toBeDefined();
		});

		it("должен использовать useFactory для создания опций", async () => {
			const useFactory = jest.fn().mockResolvedValue(mockOptions);
			const asyncOptions: PrismaClientModuleAsyncOptions<[], MockPrismaClient> = {
				useFactory,
			};

			const dynamicModule = PrismaModule.forRootAsync(asyncOptions);

			await Test.createTestingModule({
				imports: [dynamicModule],
			}).compile();

			expect(useFactory).toHaveBeenCalled();
		});

		it("должен использовать inject зависимости, если они указаны", () => {
			const _mockDependency = { value: "test" };
			const useFactory = jest.fn().mockResolvedValue(mockOptions);
			const asyncOptions: PrismaClientModuleAsyncOptions<[typeof _mockDependency], MockPrismaClient> =
				{
					useFactory,
					inject: ["MOCK_DEPENDENCY"],
				};

			const dynamicModule = PrismaModule.forRootAsync(asyncOptions);

			expect(dynamicModule.providers).toBeDefined();
			const optionsProvider = dynamicModule.providers?.find(
				(provider) => (provider as { provide: symbol }).provide === PRISMA_CLIENT_OPTIONS
			) as { inject?: unknown[] };

			expect(optionsProvider.inject).toEqual(["MOCK_DEPENDENCY"]);
		});

		it("должен использовать пустой массив inject, если он не указан", () => {
			const asyncOptions: PrismaClientModuleAsyncOptions<[], MockPrismaClient> = {
				useFactory: jest.fn().mockResolvedValue(mockOptions),
			};

			const dynamicModule = PrismaModule.forRootAsync(asyncOptions);

			expect(dynamicModule.providers).toBeDefined();
			const optionsProvider = dynamicModule.providers?.find(
				(provider) => (provider as { provide: symbol }).provide === PRISMA_CLIENT_OPTIONS
			) as { inject?: unknown[] };

			expect(optionsProvider.inject).toEqual([]);
		});

		it("должен использовать пустой массив imports, если он не указан", () => {
			const asyncOptions: PrismaClientModuleAsyncOptions<[], MockPrismaClient> = {
				useFactory: jest.fn().mockResolvedValue(mockOptions),
			};

			const dynamicModule = PrismaModule.forRootAsync(asyncOptions);

			expect(dynamicModule.imports).toEqual([]);
		});

		it("должен использовать указанные imports", () => {
			const mockModule = class MockModule {};
			const asyncOptions: PrismaClientModuleAsyncOptions<[], MockPrismaClient> = {
				useFactory: jest.fn().mockResolvedValue(mockOptions),
				imports: [mockModule],
			};

			const dynamicModule = PrismaModule.forRootAsync(asyncOptions);

			expect(dynamicModule.imports).toEqual([mockModule]);
		});

		it("должен создавать PrismaService через useFactory с правильными зависимостями", async () => {
			const useFactory = jest.fn().mockResolvedValue(mockOptions);
			const asyncOptions: PrismaClientModuleAsyncOptions<[], MockPrismaClient> = {
				useFactory,
			};

			const dynamicModule = PrismaModule.forRootAsync(asyncOptions);

			const module: TestingModule = await Test.createTestingModule({
				imports: [dynamicModule],
			}).compile();

			const service = module.get<PrismaService<MockPrismaClient>>(PrismaService);

			expect(service).toBeDefined();
			expect(service).toBeInstanceOf(PrismaService);
		});

		it("должен корректно работать с синхронной useFactory", async () => {
			const useFactory = jest.fn().mockReturnValue(mockOptions);
			const asyncOptions: PrismaClientModuleAsyncOptions<[], MockPrismaClient> = {
				useFactory,
			};

			const dynamicModule = PrismaModule.forRootAsync(asyncOptions);

			const module: TestingModule = await Test.createTestingModule({
				imports: [dynamicModule],
			}).compile();

			const service = module.get<PrismaService<MockPrismaClient>>(PrismaService);

			expect(service).toBeDefined();
		});

		it("должен корректно работать с асинхронной useFactory", async () => {
			const useFactory = jest.fn().mockResolvedValue(mockOptions);
			const asyncOptions: PrismaClientModuleAsyncOptions<[], MockPrismaClient> = {
				useFactory,
			};

			const dynamicModule = PrismaModule.forRootAsync(asyncOptions);

			const module: TestingModule = await Test.createTestingModule({
				imports: [dynamicModule],
			}).compile();

			const service = module.get<PrismaService<MockPrismaClient>>(PrismaService);

			expect(service).toBeDefined();
		});
	});
});

// Мок для PrismaClientLike
interface MockPrismaClient extends PrismaClientLike {
	$disconnect: jest.Mock<Promise<void>>;
}
