// Интерфейс для Prisma Client с основными методами Prisma
export interface PrismaClientLike {
	// Подключение к базе данных
	$connect: () => Promise<void>;
	// Отключение от базы данных
	$disconnect: () => Promise<void>;
	/**
	 * Транзакции (два варианта: массив промисов или функция)
	 * Используем более гибкие типы для совместимости с реальным PrismaClient
	 */
	$transaction: {
		<P extends Promise<unknown>[]>(
			arg: [...P],
			options?: { maxWait?: number; timeout?: number; isolationLevel?: string | unknown }
		): Promise<{ [K in keyof P]: Awaited<P[K]> }>;
		<R>(
			fn: (prisma: PrismaClientLike) => Promise<R>,
			options?: { maxWait?: number; timeout?: number; isolationLevel?: string | unknown }
		): Promise<R>;
	};
	/**
	 * События - используем более гибкую сигнатуру для совместимости с реальным PrismaClient
	 * Реальный PrismaClient использует дженерики, но мы делаем интерфейс совместимым
	 * Используем более широкий тип для совместимости с реальным PrismaClient
	 */
	$on: (event: string | string[], callback: (e: unknown) => void) => void;
	// Middleware
	$use: (params: {
		model?: string;
		action: string;
		args: unknown;
		dataPath: string[];
		runInTransaction: boolean;
	}) => Promise<unknown>;
	/**
	 * Сырые SQL запросы (безопасные)
	 * Реальный PrismaClient принимает TemplateStringsArray | Sql
	 * Используем более широкий тип через union для совместимости
	 */
	$queryRaw: <T = unknown>(
		query: TemplateStringsArray | Record<string, unknown>,
		...values: unknown[]
	) => Promise<T>;
	$executeRaw: (
		query: TemplateStringsArray | Record<string, unknown>,
		...values: unknown[]
	) => Promise<number>;
	// Сырые SQL запросы (небезопасные)
	$queryRawUnsafe: <T = unknown>(query: string, ...values: unknown[]) => Promise<T>;
	$executeRawUnsafe: (query: string, ...values: unknown[]) => Promise<number>;
	/**
	 * Расширение клиента - используем более гибкую сигнатуру для совместимости
	 * Реальный PrismaClient принимает ExtensionArgs | ((client: Client) => Client)
	 * Используем более широкий тип для параметра через union
	 */
	$extends: <T extends Record<string, unknown>>(
		extension: ((client: PrismaClientLike) => T) | Record<string, unknown>
	) => PrismaClientLike & T;
}
