import { Module, Global, DynamicModule, Provider } from "@nestjs/common";
import PrismaService from "src/main/prisma.service";
import { PRISMA_CLIENT_OPTIONS } from "src/utils/injection-keys";

import type {
	PrismaClientModuleOptions,
	PrismaClientModuleAsyncOptions,
} from "src/types/module-options.interface";
import type { PrismaClientLike } from "src/types/prisma-client.interface";

// Глобальный модуль для единого подключения к Prisma Client
@Global()
@Module({})
export default class PrismaModule {
	// Регистрация модуля с динамическими опциями через useFactory
	static forRootAsync<T extends unknown[] = [], TClient extends PrismaClientLike = PrismaClientLike>(
		options: PrismaClientModuleAsyncOptions<T, TClient>
	): DynamicModule {
		const providers: Provider[] = [
			{
				provide: PRISMA_CLIENT_OPTIONS,
				useFactory: options.useFactory,
				inject: options.inject || [],
			},
			{
				provide: PrismaService,
				useFactory: (moduleOptions: PrismaClientModuleOptions<TClient>): PrismaService<TClient> => {
					// NestJS автоматически вызовет onModuleInit() - не нужно вызывать вручную
					return new PrismaService<TClient>(moduleOptions);
				},
				inject: [PRISMA_CLIENT_OPTIONS],
			},
		];

		return {
			module: PrismaModule,
			imports: options.imports || [],
			providers,
			exports: [PrismaService],
		};
	}
}
