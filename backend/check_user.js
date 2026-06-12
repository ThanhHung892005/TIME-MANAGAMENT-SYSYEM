const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("Users in DB:");
  console.dir(users, { depth: null });
  
  const otps = await prisma.oTP.findMany();
  console.log("OTPs in DB:");
  console.dir(otps, { depth: null });
}

main().catch(console.error).finally(() => prisma.$disconnect());
