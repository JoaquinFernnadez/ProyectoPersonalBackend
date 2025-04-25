const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const intercambios = await prisma.intercambioGTS.findMany({
      where: { estado: 'intercambiado' } 
    });
    console.log(` Encontrados: ${intercambios.length} intercambios con estado "intercambiado"`)

    const deleted = await prisma.intercambioGTS.deleteMany({
      where: { estado: 'intercambiado' }
    })

    console.log(` Eliminados ${deleted.count} intercambios con estado "intercambiado"`)
  } catch (err) {
    console.error('Error:', err)
  } finally {
    await prisma.$disconnect()
  }
})()