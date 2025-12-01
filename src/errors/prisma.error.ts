// Пользовательская ошибка Prisma Client
export default class PrismaClientError extends Error {
	constructor(
		readonly message: string,
		private readonly originalError?: unknown
	) {
		super(message);
		this.name = "PrismaClientError";

		// Сохраняем stack trace оригинальной ошибки
		if (this.originalError instanceof Error && this.originalError.stack) {
			this.stack = this.originalError.stack;
		}
	}

	// Получить оригинальную ошибку для дальнейшей обработки
	getOriginalError(): unknown {
		return this.originalError;
	}
}
