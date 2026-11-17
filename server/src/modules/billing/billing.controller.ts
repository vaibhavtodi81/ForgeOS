import type { RequestHandler } from 'express'
import { sendSuccess } from '../../utils/api-response.js'
import * as service from './billing.service.js'

const actor = (req: Parameters<RequestHandler>[0]) => req.user!
export const list: RequestHandler = async (req, res) => {
  const result = await service.listBills(actor(req), req.query as never)
  sendSuccess(res, 200, result.bills, 'Bills fetched successfully', result.meta)
}
export const create: RequestHandler = async (req, res) => sendSuccess(res, 201, await service.createBill(actor(req), req.body), 'Bill created successfully')
export const detail: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.detail(actor(req), Number(req.params.id)), 'Bill fetched successfully')
export const update: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.updateBill(actor(req), Number(req.params.id), req.body), 'Bill updated successfully')
export const remove: RequestHandler = async (req, res) => { await service.deleteBill(actor(req), Number(req.params.id)); sendSuccess(res, 200, null, 'Bill deleted successfully') }
export const approve: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.approveBill(actor(req), Number(req.params.id)), 'Bill approved successfully')
export const reject: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.rejectBill(actor(req), Number(req.params.id), req.body.reason), 'Bill rejected successfully')
export const payments: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.listPayments(actor(req), Number(req.params.id), req.query as never), 'Payments fetched successfully')
export const createPayment: RequestHandler = async (req, res) => sendSuccess(res, 201, await service.createPayment(actor(req), Number(req.params.id), req.body), 'Payment recorded successfully')
export const projectExpenses: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.projectExpenses(actor(req), Number(req.params.projectId), req.query as never), 'Project expenses fetched successfully')
export const vendorOutstanding: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.vendorOutstanding(actor(req), req.query as never), 'Vendor outstanding report fetched successfully')
export const paymentHistory: RequestHandler = async (req, res) => sendSuccess(res, 200, await service.paymentHistory(actor(req), req.query as never), 'Payment history fetched successfully')
