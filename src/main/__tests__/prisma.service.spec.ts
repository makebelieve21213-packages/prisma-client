import { Test } from "@nestjs/testing";
import PrismaClientError from "src/errors/prisma.error";
import PrismaService from "src/main/prisma.service";
import { PRISMA_CLIENT_OPTIONS } from "src/utils/injection-keys";

import type { TestingModule } from "@nestjs/testing";
import type { PrismaClientModuleOptions } from "src/types/module-options.interface";
import type { PrismaClientLike } from "src/types/prisma-client.interface";

describe("PrismaService", () => {
	let service: PrismaService<MockPrismaClient>;
	let mockClient: MockPrismaClient;
	let mockOptions: PrismaClientModuleOptions<MockPrismaClient>;

	beforeEach(() => {
		mockClient = {
			$connect: jest.fn().mockResolvedValue(undefined),
			$disconnect: jest.fn().mockResolvedValue(undefined),
			$transaction: jest.fn() as MockPrismaClient["$transaction"],
			$on: jest.fn(),
			$use: jest.fn().mockResolvedValue(undefined),
			$queryRaw: jest.fn().mockResolvedValue([]) as MockPrismaClient["$queryRaw"],
			$executeRaw: jest.fn().mockResolvedValue(0),
			$queryRawUnsafe: jest.fn().mockResolvedValue([]) as MockPrismaClient["$queryRawUnsafe"],
			$executeRawUnsafe: jest.fn().mockResolvedValue(0),
			$extends: jest.fn().mockReturnThis() as MockPrismaClient["$extends"],
		} as MockPrismaClient;

		mockOptions = {
			clientFactory: jest.fn().mockReturnValue(mockClient),
		};
	});

	describe("конструктор", () => {
		it("должен создавать экземпляр сервиса с опциями", async () => {
			const module: TestingModule = await Test.createTestingModule({
				providers: [
					{
						provide: PRISMA_CLIENT_OPTIONS,
						useValue: mockOptions,
					},
					PrismaService,
				],
			}).compile();

			service = module.get<PrismaService<MockPrismaClient>>(PrismaService);

			expect(service).toBeDefined();
			expect(service).toBeInstanceOf(PrismaService);
		});
	});

	describe("onModuleInit", () => {
		it("должен инициализировать Prisma Client при старте модуля", async () => {
			const module: TestingModule = await Test.createTestingModule({
				providers: [
					{
						provide: PRISMA_CLIENT_OPTIONS,
						useValue: mockOptions,
					},
					PrismaService,
				],
			}).compile();

			service = module.get<PrismaService<MockPrismaClient>>(PrismaService);

			await service.onModuleInit();

			expect(mockOptions.clientFactory).toHaveBeenCalledTimes(1);
			expect(mockOptions.clientFactory).toHaveBeenCalledWith();
		});

		it("не должен повторно инициализировать клиент, если он уже инициализирован", async () => {
			const module: TestingModule = await Test.createTestingModule({
				providers: [
					{
						provide: PRISMA_CLIENT_OPTIONS,
						useValue: mockOptions,
					},
					PrismaService,
				],
			}).compile();

			service = module.get<PrismaService<MockPrismaClient>>(PrismaService);

			await service.onModuleInit();
			await service.onModuleInit();

			expect(mockOptions.clientFactory).toHaveBeenCalledTimes(1);
		});
	});

	describe("client getter", () => {
		it("должен возвращать экземпляр Prisma Client после инициализации", async () => {
			const module: TestingModule = await Test.createTestingModule({
				providers: [
					{
						provide: PRISMA_CLIENT_OPTIONS,
						useValue: mockOptions,
					},
					PrismaService,
				],
			}).compile();

			service = module.get<PrismaService<MockPrismaClient>>(PrismaService);

			await service.onModuleInit();

			const client = service.client;

			expect(client).toBe(mockClient);
		});

		it("должен выбрасывать ошибку, если клиент не инициализирован", async () => {
			const module: TestingModule = await Test.createTestingModule({
				providers: [
					{
						provide: PRISMA_CLIENT_OPTIONS,
						useValue: mockOptions,
					},
					PrismaService,
				],
			}).compile();

			service = module.get<PrismaService<MockPrismaClient>>(PrismaService);

			expect(() => service.client).toThrow(PrismaClientError);
			expect(() => service.client).toThrow("Prisma Client не инициализирован");
		});
	});

	describe("disconnect", () => {
		it("должен отключать клиент от базы данных", async () => {
			const module: TestingModule = await Test.createTestingModule({
				providers: [
					{
						provide: PRISMA_CLIENT_OPTIONS,
						useValue: mockOptions,
					},
					PrismaService,
				],
			}).compile();

			service = module.get<PrismaService<MockPrismaClient>>(PrismaService);

			await service.onModuleInit();
			await service.disconnect();

			expect(mockClient.$disconnect).toHaveBeenCalledTimes(1);
		});

		it("должен устанавливать клиент в null после отключения", async () => {
			const module: TestingModule = await Test.createTestingModule({
				providers: [
					{
						provide: PRISMA_CLIENT_OPTIONS,
						useValue: mockOptions,
					},
					PrismaService,
				],
			}).compile();

			service = module.get<PrismaService<MockPrismaClient>>(PrismaService);

			await service.onModuleInit();
			await service.disconnect();

			expect(() => service.client).toThrow(PrismaClientError);
		});

		it("не должен выбрасывать ошибку, если клиент не инициализирован", async () => {
			const module: TestingModule = await Test.createTestingModule({
				providers: [
					{
						provide: PRISMA_CLIENT_OPTIONS,
						useValue: mockOptions,
					},
					PrismaService,
				],
			}).compile();

			service = module.get<PrismaService<MockPrismaClient>>(PrismaService);

			await expect(service.disconnect()).resolves.not.toThrow();
		});

		it("должен обрабатывать ошибки при отключении", async () => {
			const disconnectError = new Error("Ошибка отключения");
			mockClient.$disconnect = jest.fn().mockRejectedValue(disconnectError);

			const module: TestingModule = await Test.createTestingModule({
				providers: [
					{
						provide: PRISMA_CLIENT_OPTIONS,
						useValue: mockOptions,
					},
					PrismaService,
				],
			}).compile();

			service = module.get<PrismaService<MockPrismaClient>>(PrismaService);

			await service.onModuleInit();

			await expect(service.disconnect()).rejects.toThrow(disconnectError);
		});
	});

	describe("onModuleDestroy", () => {
		it("должен вызывать disconnect при уничтожении модуля", async () => {
			const module: TestingModule = await Test.createTestingModule({
				providers: [
					{
						provide: PRISMA_CLIENT_OPTIONS,
						useValue: mockOptions,
					},
					PrismaService,
				],
			}).compile();

			service = module.get<PrismaService<MockPrismaClient>>(PrismaService);

			await service.onModuleInit();
			const disconnectSpy = jest.spyOn(service, "disconnect");

			await service.onModuleDestroy();

			expect(disconnectSpy).toHaveBeenCalledTimes(1);
		});

		it("должен корректно обрабатывать уничтожение модуля без инициализации", async () => {
			const module: TestingModule = await Test.createTestingModule({
				providers: [
					{
						provide: PRISMA_CLIENT_OPTIONS,
						useValue: mockOptions,
					},
					PrismaService,
				],
			}).compile();

			service = module.get<PrismaService<MockPrismaClient>>(PrismaService);

			await expect(service.onModuleDestroy()).resolves.not.toThrow();
		});
	});
});

// Мок для PrismaClientLike
type MockPrismaClient = Omit<
	PrismaClientLike,
	| "$extends"
	| "$connect"
	| "$disconnect"
	| "$transaction"
	| "$on"
	| "$use"
	| "$queryRaw"
	| "$executeRaw"
	| "$queryRawUnsafe"
	| "$executeRawUnsafe"
> & {
	$connect: jest.Mock<Promise<void>>;
	$disconnect: jest.Mock<Promise<void>>;
	$transaction: jest.Mock & PrismaClientLike["$transaction"];
	$on: jest.Mock<void, [string | string[], (e: unknown) => void]>;
	$use: jest.Mock<
		Promise<unknown>,
		[PrismaClientLike["$use"] extends (params: infer P) => Promise<unknown> ? P : never]
	>;
	$queryRaw: <T = unknown>(query: TemplateStringsArray, ...values: unknown[]) => Promise<T>;
	$executeRaw: (query: TemplateStringsArray, ...values: unknown[]) => Promise<number>;
	$queryRawUnsafe: <T = unknown>(query: string, ...values: unknown[]) => Promise<T>;
	$executeRawUnsafe: (query: string, ...values: unknown[]) => Promise<number>;
	$extends: <T extends Record<string, unknown>>(
		extension: (client: MockPrismaClient) => T
	) => MockPrismaClient & T;
};
