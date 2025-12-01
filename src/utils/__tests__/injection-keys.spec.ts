import { PRISMA_CLIENT_OPTIONS } from "src/utils/injection-keys";

describe("injection-keys", () => {
	describe("PRISMA_CLIENT_OPTIONS", () => {
		it("должен быть символом", () => {
			expect(typeof PRISMA_CLIENT_OPTIONS).toBe("symbol");
		});

		it("должен иметь правильное описание", () => {
			const description = PRISMA_CLIENT_OPTIONS.toString();
			expect(description).toContain("PRISMA_CLIENT_OPTIONS");
		});

		it("должен быть уникальным символом", () => {
			const anotherSymbol = Symbol("PRISMA_CLIENT_OPTIONS");
			expect(PRISMA_CLIENT_OPTIONS).not.toBe(anotherSymbol);
		});

		it("должен быть доступен для импорта", () => {
			expect(PRISMA_CLIENT_OPTIONS).toBeDefined();
		});
	});
});
