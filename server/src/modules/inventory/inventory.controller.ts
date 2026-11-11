import type { RequestHandler } from 'express'
import { sendSuccess } from '../../utils/api-response.js'
import * as service from './inventory.service.js'

export const inventory: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.listInventory(req.user!, Number(req.params.projectId)), 'Inventory fetched successfully')
export const createTransaction: RequestHandler = async (req, res) => sendSuccess(res, 201, await service.createTransaction(req.user!, Number(req.params.projectId), req.body), 'Stock transaction recorded successfully')
export const transactions: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.listTransactions(req.user!, Number(req.params.projectId), req.query as never), 'Stock transactions fetched successfully')
export const summary: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.getSummary(req.user!, Number(req.params.projectId)), 'Inventory summary fetched successfully')
export const wastage: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.getWastage(req.user!, Number(req.params.projectId)), 'Wastage report fetched successfully')
