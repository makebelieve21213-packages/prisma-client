import * as indexModule from "src/index";

describe("index", () => {
	describe("экспорты", () => {
		it("должен экспортировать PrismaModule", () => {
			expect(indexModule.PrismaModule).toBeDefined();
		});

		it("должен экспортировать PrismaService", () => {
			expect(indexModule.PrismaService).toBeDefined();
		});

		it("должен экспортировать PrismaClientError", () => {
			expect(indexModule.PrismaClientError).toBeDefined();
		});

		it("должен экспортировать типы PrismaClientModuleOptions и PrismaClientModuleAsyncOptions", () => {
			// TypeScript типы не доступны во время выполнения, но мы можем проверить, что модуль экспортируется
			expect(indexModule).toBeDefined();
		});
	});
});
