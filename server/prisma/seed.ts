import { randomBytes, scryptSync } from 'node:crypto'
import { PrismaClient, ProjectStatus, Role } from '@prisma/client'

const prisma = new PrismaClient()

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `scrypt$${salt}$${hash}`
}

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? randomBytes(24).toString('base64url')
  const pmPassword = process.env.SEED_PM_PASSWORD ?? randomBytes(24).toString('base64url')

  const admin = await prisma.user.upsert({
    where: { email: 'admin@forgeos.local' },
    update: { name: 'ForgeOS Administrator', role: Role.ADMIN, isActive: true, passwordHash: hashPassword(adminPassword) },
    create: {
      name: 'ForgeOS Administrator',
      email: 'admin@forgeos.local',
      passwordHash: hashPassword(adminPassword),
      role: Role.ADMIN,
    },
  })

  const pm = await prisma.user.upsert({
    where: { email: 'pm@forgeos.local' },
    update: { name: 'ForgeOS Project Manager', role: Role.PM, isActive: true, passwordHash: hashPassword(pmPassword) },
    create: {
      name: 'ForgeOS Project Manager',
      email: 'pm@forgeos.local',
      passwordHash: hashPassword(pmPassword),
      role: Role.PM,
    },
  })

  const existingLand = await prisma.land.findFirst({
    where: { name: 'ForgeOS Development Parcel' },
  })
  const land = existingLand ?? await prisma.land.create({
    data: {
      name: 'ForgeOS Development Parcel',
      city: 'Gurugram',
      state: 'Haryana',
      areaValue: 2.5,
      areaUnit: 'ACRE',
      createdById: admin.id,
    },
  })

  const project = await prisma.project.upsert({
    where: { code: 'DEV-001' },
    update: {
      name: 'ForgeOS Development Project',
      status: ProjectStatus.ACTIVE,
      assignedPmId: pm.id,
      createdById: admin.id,
      landId: land.id,
    },
    create: {
      code: 'DEV-001',
      name: 'ForgeOS Development Project',
      status: ProjectStatus.ACTIVE,
      assignedPmId: pm.id,
      createdById: admin.id,
      landId: land.id,
      totalBudget: 1000000,
    },
  })

  console.log(`Seeded admin ${admin.email}, PM ${pm.email}, land ${land.id}, project ${project.code}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
