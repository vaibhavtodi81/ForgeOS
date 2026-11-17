import type { MaterialCategory } from '@prisma/client'
import { prisma } from '../../utils/prisma.js'
import { AppError } from '../../utils/errors.js'
import type { CreateMaterialInput, MaterialListQuery, UpdateMaterialInput } from './materials.validator.js'

export async function listMaterials(query: MaterialListQuery) {
  return prisma.material.findMany({
    where: {
      ...(query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {}),
      ...(query.category ? { category: query.category as MaterialCategory } : {}),
      ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
    },
    orderBy: { name: 'asc' },
  })
}

export async function getMaterial(id: number) {
  const material = await prisma.material.findUnique({ where: { id } })
  if (!material) throw new AppError('NOT_FOUND', 'Material not found.', 404)
  return material
}

export async function createMaterial(input: CreateMaterialInput) {
  return prisma.material.create({
    data: {
      name: input.name,
      category: input.category as MaterialCategory,
      unit: input.unit,
      description: input.description ?? null,
    },
  })
}

export async function updateMaterial(id: number, input: UpdateMaterialInput) {
  await getMaterial(id)
  return prisma.material.update({
    where: { id },
    data: {
      ...(input.name === undefined ? {} : { name: input.name }),
      ...(input.category === undefined ? {} : { category: input.category as MaterialCategory }),
      ...(input.unit === undefined ? {} : { unit: input.unit }),
      ...(input.description === undefined ? {} : { description: input.description }),
    },
  })
}
