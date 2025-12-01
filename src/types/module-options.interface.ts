import type { InjectionToken, ModuleMetadata, OptionalFactoryDependency } from "@nestjs/common";
import type { PrismaClientLike } from "src/types/prisma-client.interface";

// Опции конфигурации для Prisma Client модуля
export interface PrismaClientModuleOptions<T extends PrismaClientLike = PrismaClientLike> {
	// Фабрика для создания экземпляра PrismaClient
	clientFactory: () => T;
}

// Тип для функции фабрики с динамическими аргументами
type PrismaModuleOptionsFactory<
	T extends unknown[] = [],
	TClient extends PrismaClientLike = PrismaClientLike,
> = (
	...args: T
) => Promise<PrismaClientModuleOptions<TClient>> | PrismaClientModuleOptions<TClient>;

// Асинхронные опции для динамической конфигурации модуля через useFactory
export interface PrismaClientModuleAsyncOptions<
	T extends unknown[] = [],
	TClient extends PrismaClientLike = PrismaClientLike,
> extends Pick<ModuleMetadata, "imports"> {
	/**
	 * Фабрика для создания опций
	 * Аргументы функции соответствуют зависимостям из inject
	 */
	useFactory: PrismaModuleOptionsFactory<T, TClient>;
	// Зависимости для инъекции в useFactory
	inject?: (InjectionToken | OptionalFactoryDependency)[];
}
