/**
 * Script de migration : systemId → versionId + hackId
 *
 * Migration :
 * - systemId "city-of-mist" → versionId "1.0" + hackId "city-of-mist"
 * - systemId "litm" → versionId "2.0" + hackId "litm"
 *
 * Usage : pnpm tsx scripts/migrate-playspace-version-hack.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Migration systemId → versionId + hackId')
  console.log('=' .repeat(50))

  // Compter playspaces avant migration
  const totalBefore = await prisma.playspace.count()
  console.log(`📊 Playspaces total : ${totalBefore}`)

  const comBefore = await prisma.playspace.count({
    where: { systemId: 'city-of-mist' }
  })
  console.log(`📊 City of Mist (systemId) : ${comBefore}`)

  const litmBefore = await prisma.playspace.count({
    where: { systemId: 'litm' }
  })
  console.log(`📊 LITM (systemId) : ${litmBefore}`)

  console.log('=' .repeat(50))

  // Migration City of Mist
  console.log('\n1️⃣ Migration City of Mist...')
  const comUpdated = await prisma.playspace.updateMany({
    where: { systemId: 'city-of-mist' },
    data: {
      versionId: '1.0',
      hackId: 'city-of-mist'
    }
  })
  console.log(`✅ ${comUpdated.count} playspaces City of Mist migrés`)

  // Migration LITM
  console.log('\n2️⃣ Migration LITM...')
  const litmUpdated = await prisma.playspace.updateMany({
    where: { systemId: 'litm' },
    data: {
      versionId: '2.0',
      hackId: 'litm'
    }
  })
  console.log(`✅ ${litmUpdated.count} playspaces LITM migrés`)

  // Vérification post-migration
  console.log('\n' + '=' .repeat(50))
  console.log('📊 VÉRIFICATION POST-MIGRATION')
  console.log('=' .repeat(50))

  const v1Count = await prisma.playspace.count({
    where: { versionId: '1.0' }
  })
  console.log(`✅ Version 1.0 : ${v1Count} playspaces`)

  const v2Count = await prisma.playspace.count({
    where: { versionId: '2.0' }
  })
  console.log(`✅ Version 2.0 : ${v2Count} playspaces`)

  const nullVersion = await prisma.playspace.count({
    where: { versionId: null }
  })
  console.log(`⚠️  versionId NULL : ${nullVersion} playspaces`)

  const nullHack = await prisma.playspace.count({
    where: { hackId: null }
  })
  console.log(`⚠️  hackId NULL : ${nullHack} playspaces`)

  // Validation finale
  console.log('\n' + '=' .repeat(50))

  if (nullVersion > 0 || nullHack > 0) {
    console.error('❌ MIGRATION INCOMPLÈTE : Certains playspaces ont versionId ou hackId NULL')
    process.exit(1)
  }

  if (v1Count + v2Count !== totalBefore) {
    console.error(`❌ COUNT MISMATCH : avant=${totalBefore}, après=${v1Count + v2Count}`)
    process.exit(1)
  }

  console.log('✅ MIGRATION RÉUSSIE : Tous playspaces migrés correctement')
  console.log('=' .repeat(50))
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Erreur migration:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
