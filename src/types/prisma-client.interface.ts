// Интерфейс для Prisma Client, который имеет метод $disconnect
export interface PrismaClientLike {
	$disconnect: () => Promise<void>;
}
