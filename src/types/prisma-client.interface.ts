// Интерфейс для Prisma Client с основными методами Prisma
export interface PrismaClientLike {
	// Подключение к базе данных
	$connect: () => Promise<void>;
	// Отключение от базы данных
	$disconnect: () => Promise<void>;
	// Транзакции (два варианта: массив промисов или функция)
	$transaction: {
		<P extends Promise<unknown>[]>(
			arg: [...P],
			options?: { maxWait?: number; timeout?: number; isolationLevel?: string }
		): Promise<{ [K in keyof P]: Awaited<P[K]> }>;
		<R>(
			fn: (prisma: PrismaClientLike) => Promise<R>,
			options?: { maxWait?: number; timeout?: number; isolationLevel?: string }
		): Promise<R>;
	};
	// События
	$on: (event: string | string[], callback: (e: unknown) => void) => void;
	// Middleware
	$use: (params: {
		model?: string;
		action: string;
		args: unknown;
		dataPath: string[];
		runInTransaction: boolean;
	}) => Promise<unknown>;
	// Сырые SQL запросы (безопасные)
	$queryRaw: <T = unknown>(query: TemplateStringsArray, ...values: unknown[]) => Promise<T>;
	$executeRaw: (query: TemplateStringsArray, ...values: unknown[]) => Promise<number>;
	// Сырые SQL запросы (небезопасные)
	$queryRawUnsafe: <T = unknown>(query: string, ...values: unknown[]) => Promise<T>;
	$executeRawUnsafe: (query: string, ...values: unknown[]) => Promise<number>;
	// Расширение клиента
	$extends: <T extends Record<string, unknown>>(extension: (client: this) => T) => this & T;
}
