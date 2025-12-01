import PrismaClientError from "src/errors/prisma.error";

describe("PrismaClientError", () => {
	describe("конструктор", () => {
		it("должен создавать ошибку с сообщением", () => {
			const message = "Тестовое сообщение об ошибке";
			const error = new PrismaClientError(message);

			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(PrismaClientError);
			expect(error.message).toBe(message);
			expect(error.name).toBe("PrismaClientError");
		});

		it("должен создавать ошибку с сообщением и оригинальной ошибкой", () => {
			const message = "Тестовое сообщение";
			const originalError = new Error("Оригинальная ошибка");
			const error = new PrismaClientError(message, originalError);

			expect(error.message).toBe(message);
			expect(error.name).toBe("PrismaClientError");
			expect(error.getOriginalError()).toBe(originalError);
		});

		it("должен сохранять stack trace оригинальной ошибки, если она является Error", () => {
			const message = "Тестовое сообщение";
			const originalError = new Error("Оригинальная ошибка");
			originalError.stack = "Error: Оригинальная ошибка\n    at test.js:1:1";
			const error = new PrismaClientError(message, originalError);

			expect(error.stack).toBe(originalError.stack);
		});

		it("не должен сохранять stack trace, если оригинальная ошибка не является Error", () => {
			const message = "Тестовое сообщение";
			const originalError = "Простая строка";
			const error = new PrismaClientError(message, originalError);

			expect(error.stack).toBeDefined();
			expect(error.stack).not.toBe("Простая строка");
		});

		it("не должен сохранять stack trace, если у оригинальной ошибки нет stack", () => {
			const message = "Тестовое сообщение";
			const originalError = { message: "Объект ошибки" };
			const error = new PrismaClientError(message, originalError);

			expect(error.stack).toBeDefined();
		});
	});

	describe("getOriginalError", () => {
		it("должен возвращать оригинальную ошибку", () => {
			const message = "Тестовое сообщение";
			const originalError = new Error("Оригинальная ошибка");
			const error = new PrismaClientError(message, originalError);

			expect(error.getOriginalError()).toBe(originalError);
		});

		it("должен возвращать undefined, если оригинальная ошибка не была передана", () => {
			const message = "Тестовое сообщение";
			const error = new PrismaClientError(message);

			expect(error.getOriginalError()).toBeUndefined();
		});

		it("должен возвращать любой тип оригинальной ошибки", () => {
			const message = "Тестовое сообщение";
			const originalError = { code: "ERROR_CODE", details: "Детали" };
			const error = new PrismaClientError(message, originalError);

			expect(error.getOriginalError()).toBe(originalError);
		});
	});
});
