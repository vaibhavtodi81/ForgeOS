import type { RequestHandler } from 'express'
import { sendSuccess } from '../../utils/api-response.js'
import * as service from './audit.service.js'

export const listLogs: RequestHandler = async (req, res) => {
  const result = await service.listAuditLogs(req.query as never)
  sendSuccess(res, 200, result.items, 'Audit logs fetched successfully', result.meta)
}

export const stats: RequestHandler = async (_req, res) => {
  const result = await service.getAuditLogStats()
  sendSuccess(res, 200, result, 'Audit stats fetched successfully')
}
