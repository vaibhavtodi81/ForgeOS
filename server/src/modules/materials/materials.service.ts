import type { MaterialCategory } from '@prisma/client' // Uses Prisma's generated types and client to work safely with database records.
import { prisma } from '../../utils/prisma.js' // Uses the shared Prisma client to run queries through the server's database connection.
import { AppError } from '../../utils/errors.js' // Uses the shared API error type so failures have a consistent message and HTTP status.
import type { CreateMaterialInput, MaterialListQuery, UpdateMaterialInput } from './materials.validator.js' // Imports type { CreateMaterialInput, MaterialListQuery, UpdateMaterialInput } from './materials.validator.js' so this module can reuse that functionality.

export async function listMaterials(query: MaterialListQuery) { // Defines `listMaterials` to retrieve a list of materials, keeping this behavior reusable.
  return prisma.material.findMany({ // Returns the database result to the route handler so it can form the API response.
    where: { // Sets `where` to filters the database records to the requested scope.
      ...(query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {}), // Separates this argument or property from the next item in the surrounding call or object.
      ...(query.category ? { category: query.category as MaterialCategory } : {}), // Separates this argument or property from the next item in the surrounding call or object.
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }), // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
    orderBy: { name: 'asc' }, // Separates this argument or property from the next item in the surrounding call or object.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.

export async function getMaterial(id: number) { // Defines `getMaterial` to retrieve material, keeping this behavior reusable.
  const material = await prisma.material.findUnique({ where: { id } }) // Looks up one matching database record and stores it in `material` so its existence or values can be checked.
  if (!material) throw new AppError('NOT_FOUND', 'Material not found.', 404) // Checks whether the value is missing; the block handles that case before continuing.
  return material // Returns `material` to the caller so the next layer can use the result.
} // Closes the current block and marks where its grouped work ends.

export async function createMaterial(input: CreateMaterialInput) { // Defines `createMaterial` to create material, keeping this behavior reusable.
  return prisma.material.create({ // Returns the database result to the route handler so it can form the API response.
    data: { // Sets `data` to the values to write to the database.
      name: input.name, // Separates this argument or property from the next item in the surrounding call or object.
      category: input.category as MaterialCategory, // Separates this argument or property from the next item in the surrounding call or object.
      unit: input.unit, // Separates this argument or property from the next item in the surrounding call or object.
      description: input.description ?? null, // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.

export async function updateMaterial(id: number, input: UpdateMaterialInput) { // Defines `updateMaterial` to update material, keeping this behavior reusable.
  await getMaterial(id) // Waits for this asynchronous operation to finish before using its result.
  return prisma.material.update({ // Returns the database result to the route handler so it can form the API response.
    where: { id }, // Separates this argument or property from the next item in the surrounding call or object.
    data: { // Sets `data` to the values to write to the database.
      ...(input.name === undefined ? {} : { name: input.name }), // Separates this argument or property from the next item in the surrounding call or object.
      ...(input.category === undefined ? {} : { category: input.category as MaterialCategory }), // Separates this argument or property from the next item in the surrounding call or object.
      ...(input.unit === undefined ? {} : { unit: input.unit }), // Separates this argument or property from the next item in the surrounding call or object.
      ...(input.description === undefined ? {} : { description: input.description }), // Separates this argument or property from the next item in the surrounding call or object.
    }, // Closes the current call, object, or collection so the surrounding expression can continue.
  }) // Closes the current call, object, or collection so the surrounding expression can continue.
} // Closes the current block and marks where its grouped work ends.
// File purpose: Implements materials business rules and database operations.
