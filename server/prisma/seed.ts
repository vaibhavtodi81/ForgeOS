import { randomBytes, scryptSync } from 'node:crypto' // Imports { randomBytes, scryptSync } from 'node:crypto' so this module can reuse that functionality.
import { PrismaClient, ProjectStatus, Role } from '@prisma/client' // Uses Prisma's generated types and client to work safely with database records.

const prisma = new PrismaClient() // Stores this intermediate `prisma` value so later lines can use it.

function hashPassword(password: string): string { // Defines `hashPassword` to hash password, keeping this behavior reusable.
  const salt = randomBytes(16).toString('hex') // Stores this intermediate `salt` value so later lines can use it.
  const hash = scryptSync(password, salt, 64).toString('hex') // Stores this intermediate `hash` value so later lines can use it.
  return `scrypt$${salt}$${hash}` // Returns ``scrypt$${salt}$${hash}`` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

async function main() { // Defines `main` to main, keeping this behavior reusable.
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? randomBytes(24).toString('base64url') // Stores this intermediate `admin password` value so later lines can use it.
  const pmPassword = process.env.SEED_PM_PASSWORD ?? randomBytes(24).toString('base64url') // Stores this intermediate `pm password` value so later lines can use it.

  const admin = await prisma.user.upsert({ // Stores the result of creates or updates a record in the user table in `admin` for the next steps.
    where: { email: 'admin@forgeos.local' }, // Separates this argument or property from the next item in the surrounding call or object.
    update: { name: 'ForgeOS Administrator', role: Role.ADMIN, isActive: true, passwordHash: hashPassword(adminPassword) }, // Separates this argument or property from the next item in the surrounding call or object.
    create: { // Sets `create` to the create value.
      name: 'ForgeOS Administrator', // Separates this argument or property from the next item in the surrounding call or object.
      email: 'admin@forgeos.local', // Separates this argument or property from the next item in the surrounding call or object.
      passwordHash: hashPassword(adminPassword), // Separates this argument or property from the next item in the surrounding call or object.
      role: Role.ADMIN, // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  const pm = await prisma.user.upsert({ // Stores the result of creates or updates a record in the user table in `pm` for the next steps.
    where: { email: 'pm@forgeos.local' }, // Separates this argument or property from the next item in the surrounding call or object.
    update: { name: 'ForgeOS Project Manager', role: Role.PM, isActive: true, passwordHash: hashPassword(pmPassword) }, // Separates this argument or property from the next item in the surrounding call or object.
    create: { // Sets `create` to the create value.
      name: 'ForgeOS Project Manager', // Separates this argument or property from the next item in the surrounding call or object.
      email: 'pm@forgeos.local', // Separates this argument or property from the next item in the surrounding call or object.
      passwordHash: hashPassword(pmPassword), // Separates this argument or property from the next item in the surrounding call or object.
      role: Role.PM, // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  const existingLand = await prisma.land.findFirst({ // Looks up one matching database record and stores it in `existingLand` so its existence or values can be checked.
    where: { name: 'ForgeOS Development Parcel' }, // Separates this argument or property from the next item in the surrounding call or object.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
  const land = existingLand ?? await prisma.land.create({ // Stores the result of creates a record in the land table in `land` for the next steps.
    data: { // Sets `data` to the values to write to the database.
      name: 'ForgeOS Development Parcel', // Separates this argument or property from the next item in the surrounding call or object.
      city: 'Gurugram', // Separates this argument or property from the next item in the surrounding call or object.
      state: 'Haryana', // Separates this argument or property from the next item in the surrounding call or object.
      areaValue: 2.5, // Separates this argument or property from the next item in the surrounding call or object.
      areaUnit: 'ACRE', // Separates this argument or property from the next item in the surrounding call or object.
      createdById: admin.id, // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  const project = await prisma.project.upsert({ // Stores the result of creates or updates a record in the project table in `project` for the next steps.
    where: { code: 'DEV-001' }, // Separates this argument or property from the next item in the surrounding call or object.
    update: { // Sets `update` to the update value.
      name: 'ForgeOS Development Project', // Separates this argument or property from the next item in the surrounding call or object.
      status: ProjectStatus.ACTIVE, // Separates this argument or property from the next item in the surrounding call or object.
      assignedPmId: pm.id, // Separates this argument or property from the next item in the surrounding call or object.
      createdById: admin.id, // Separates this argument or property from the next item in the surrounding call or object.
      landId: land.id, // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
    create: { // Sets `create` to the create value.
      code: 'DEV-001', // Separates this argument or property from the next item in the surrounding call or object.
      name: 'ForgeOS Development Project', // Separates this argument or property from the next item in the surrounding call or object.
      status: ProjectStatus.ACTIVE, // Separates this argument or property from the next item in the surrounding call or object.
      assignedPmId: pm.id, // Separates this argument or property from the next item in the surrounding call or object.
      createdById: admin.id, // Separates this argument or property from the next item in the surrounding call or object.
      landId: land.id, // Separates this argument or property from the next item in the surrounding call or object.
      totalBudget: 1000000, // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.

  console.log(`Seeded admin ${admin.email}, PM ${pm.email}, land ${land.id}, project ${project.code}`) // Provides `console.log(`Seeded admin ${admin.email}, PM ${pm.email}, land ${land.id}, project ${project.code}`)` as part of main.
} // Closes the current block and marks where its grouped work ends.

main() // Provides `main()` as part of main.
  .catch((error) => { // Opens the function, callback, or control-flow block that groups the related statements.
    console.error(error) // Provides `console.error(error)` as part of main.
    process.exitCode = 1 // Provides `process.exitCode = 1` as part of main.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
  .finally(async () => { // Opens the function, callback, or control-flow block that groups the related statements.
    await prisma.$disconnect() // Waits for this asynchronous operation to finish before using its result.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
// File purpose: Populates the development database with initial ForgeOS records.
