import type { RequestHandler } from 'express'
import { sendSuccess } from '../../utils/api-response.js'
import * as service from './projects.service.js'
import type {
  ProjectActivityQuery,
  ProjectDateRangeQuery,
  ProjectProgressHistoryQuery,
} from './projects.validator.js'

function actor(req: Parameters<RequestHandler>[0]) {
  if (!req.user) throw new Error('Authenticated user missing after auth middleware')
  return req.user
}
export const list: RequestHandler = async (req, res) => {
  const result = await service.listProjects(actor(req), req.query.page as unknown as number, req.query.pageSize as unknown as number, req.query.status as string | undefined, req.query.search as string | undefined)
  sendSuccess(res, 200, result.projects, 'Projects fetched successfully', result.meta)
}
export const detail: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.getProject(actor(req), Number(req.params.id)), 'Project fetched successfully')
export const progressHistory: RequestHandler = async (req, res) => sendSuccess(
  res,
  200,
  await service.getProjectProgressHistory(actor(req), Number(req.params.projectId), req.query as unknown as ProjectProgressHistoryQuery),
  'Project progress history fetched successfully',
)
export const summary: RequestHandler = async (req, res) => sendSuccess(
  res,
  200,
  await service.getProjectSummary(actor(req), Number(req.params.projectId)),
  'Project summary fetched successfully',
)
export const activity: RequestHandler = async (req, res) => {
  const result = await service.getProjectActivity(
    actor(req),
    Number(req.params.projectId),
    req.query as unknown as ProjectActivityQuery,
  )
  sendSuccess(res, 200, result.activities, 'Project activity fetched successfully', result.meta)
}
export const labourSummary: RequestHandler = async (req, res) => sendSuccess(
  res,
  200,
  await service.getLabourSummary(actor(req), Number(req.params.projectId), req.query as unknown as ProjectDateRangeQuery),
  'Labour summary fetched successfully',
)
export const machinerySummary: RequestHandler = async (req, res) => sendSuccess(
  res,
  200,
  await service.getMachinerySummary(actor(req), Number(req.params.projectId), req.query as unknown as ProjectDateRangeQuery),
  'Machinery summary fetched successfully',
)
export const workerCountHistory: RequestHandler = async (req, res) => sendSuccess(
  res,
  200,
  await service.getWorkerCountHistory(actor(req), Number(req.params.projectId), req.query as unknown as ProjectDateRangeQuery),
  'Worker count history fetched successfully',
)
export const machineryUsageHistory: RequestHandler = async (req, res) => sendSuccess(
  res,
  200,
  await service.getMachineryUsageHistory(actor(req), Number(req.params.projectId), req.query as unknown as ProjectDateRangeQuery),
  'Machinery usage history fetched successfully',
)
export const create: RequestHandler = async (req, res) => sendSuccess(res, 201, await service.createProject(actor(req), req.body), 'Project created successfully')
export const update: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.updateProject(actor(req), Number(req.params.id), req.body), 'Project updated successfully')
export const remove: RequestHandler = async (req, res) => {
  await service.getProject(actor(req), Number(req.params.id))
  await service.deleteProject(Number(req.params.id))
  sendSuccess(res, 200, null, 'Project deleted successfully')
}
