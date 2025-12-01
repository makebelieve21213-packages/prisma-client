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
			$disconnect: jest.fn().mockResolvedValue(undefined),
		};

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
interface MockPrismaClient extends PrismaClientLike {
	$disconnect: jest.Mock<Promise<void>>;
}
