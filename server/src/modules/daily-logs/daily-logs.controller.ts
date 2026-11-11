import type { RequestHandler } from 'express'
import { sendSuccess } from '../../utils/api-response.js'
import {
  createDailyLog,
  deleteDailyLog,
  getDailyLog,
  listDailyLogs,
  updateDailyLog,
} from './daily-logs.service.js'
import type { DailyLogListQuery } from './daily-logs.validator.js'

function user(req: Parameters<RequestHandler>[0]) {
  if (!req.user) throw new Error('Authenticated user missing after auth middleware')
  return req.user
}

export const list: RequestHandler = async (req, res) => {
  const result = await listDailyLogs(user(req), Number(req.params.projectId), req.query as unknown as DailyLogListQuery)
  sendSuccess(res, 200, result.logs, 'Daily logs fetched successfully', result.meta)
}

export const create: RequestHandler = async (req, res) => {
  const log = await createDailyLog(user(req), Number(req.params.projectId), req.body)
  sendSuccess(res, 201, log, 'Daily log created successfully')
}

export const detail: RequestHandler = async (req, res) => {
  const log = await getDailyLog(user(req), Number(req.params.id))
  sendSuccess(res, 200, log, 'Daily log fetched successfully')
}

export const update: RequestHandler = async (req, res) => {
  const log = await updateDailyLog(user(req), Number(req.params.id), req.body)
  sendSuccess(res, 200, log, 'Daily log updated successfully')
}

export const remove: RequestHandler = async (req, res) => {
  await deleteDailyLog(user(req), Number(req.params.id))
  sendSuccess(res, 200, null, 'Daily log deleted successfully')
}
