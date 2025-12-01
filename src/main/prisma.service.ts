import { Injectable, OnModuleDestroy, OnModuleInit, Inject } from "@nestjs/common";
import PrismaClientError from "src/errors/prisma.error";
import { PRISMA_CLIENT_OPTIONS } from "src/utils/injection-keys";

import type { PrismaClientModuleOptions } from "src/types/module-options.interface";
import type { PrismaClientLike } from "src/types/prisma-client.interface";

// Generic сервис для работы с Prisma Client
@Injectable()
export default class PrismaService<TClient extends PrismaClientLike = PrismaClientLike>
	implements OnModuleInit, OnModuleDestroy
{
	private prismaClient: TClient | null = null;

	constructor(
		@Inject(PRISMA_CLIENT_OPTIONS)
		private readonly options: PrismaClientModuleOptions<TClient>
	) {}

	// Инициализация Prisma Client при старте модуля
	async onModuleInit(): Promise<void> {
		if (!this.prismaClient) {
			this.prismaClient = this.options.clientFactory();
		}
	}

	// Очистка при остановке модуля
	async onModuleDestroy(): Promise<void> {
		await this.disconnect();
	}

	// Получить экземпляр Prisma Client
	get client(): TClient {
		if (!this.prismaClient) {
			throw new PrismaClientError("Prisma Client не инициализирован");
		}

		return this.prismaClient;
	}

	// Отключение от базы данных (graceful shutdown)
	async disconnect(): Promise<void> {
		if (this.prismaClient) {
			await this.prismaClient.$disconnect();
			this.prismaClient = null;
		}
	}
}
