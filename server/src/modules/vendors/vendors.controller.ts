import type { RequestHandler } from 'express'
import { sendSuccess } from '../../utils/api-response.js'
import * as service from './vendors.service.js'

const actor = (req: Parameters<RequestHandler>[0]) => req.user!
export const list: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.listVendors(actor(req), req.query as never), 'Vendors fetched successfully')
export const detail: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.getVendor(actor(req), Number(req.params.id)), 'Vendor fetched successfully')
export const create: RequestHandler = async (req, res) => sendSuccess(res, 201, await service.createVendor(actor(req), req.body), 'Vendor created successfully')
export const update: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.updateVendor(actor(req), Number(req.params.id), req.body), 'Vendor updated successfully')
export const deactivate: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.deactivateVendor(actor(req), Number(req.params.id)), 'Vendor deactivated successfully')
export const projectList: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.listProjectVendors(actor(req), Number(req.params.projectId)), 'Project vendors fetched successfully')
export const assign: RequestHandler = async (req, res) => sendSuccess(res, 201, await service.assignVendor(actor(req), Number(req.params.projectId), Number(req.params.vendorId)), 'Vendor assigned successfully')
export const unassign: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.unassignVendor(actor(req), Number(req.params.projectId), Number(req.params.vendorId)), 'Vendor unassigned successfully')
