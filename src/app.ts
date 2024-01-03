import { openTelemetrySDK } from './opentelemetry-sdk'
import express, { Application, Request, Response } from 'express'
import axios from 'axios'
import logger from './logger'
import { context, trace } from '@opentelemetry/api'
import { requestCounter, errorCounter } from './meter'

const app: Application = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

export const isProduction = process.env.NODE_ENV === 'production'
const server = isProduction ? process.env.SERVER2 : 'http://localhost:8000'

app.get('/1', async (_req: Request, res: Response) => {
  const currentSpan = trace.getSpan(context.active())
  const totalUsersCount = 12345 // test
  const targetBatchId = '100' // test
  if (currentSpan) {
    currentSpan.setAttributes({
      totalUsersCount,
      targetBatchId,
    })
  }

  logger.info('requested to /1')
  const instanceName = 'Dynamically retrieve the instance name of cloud run'
  requestCounter.add(1, {
    environment: 'production',
    instance_name: instanceName,
  })
  await axios.get(`${server}/2`)

  return res.status(200).send({
    message: 'requested to /1',
  })
})

app.get('/2', async (_req: Request, res: Response) => {
  const currentSpan = trace.getSpan(context.active())
  const totalUsersCount = 6789 // test
  const targetBatchId = '200' // test
  if (currentSpan) {
    currentSpan.setAttributes({
      totalUsersCount,
      targetBatchId,
    })
  }
  logger.info('requested to /2')

  return res
    .status(200)
    .send({
      message: 'requested to /2',
    })
    .end()
})

const port = process.env.PORT || 8000
try {
  app.listen(port, () => {
    console.log(`Running at Port ${port}...`)
  })
} catch (e) {
  if (e instanceof Error) {
    console.error(e.message)
  }
}

const gracefulShutdown = async () => {
  console.info('SIGINT/SIGTERM received. Shutting down...')
  try {
    await openTelemetrySDK.shutdown()
    process.exit(0)
  } catch (e) {
    const instanceName = 'Dynamically retrieve the instance name of cloud run'
    console.error('Error during shutdown', e)
    errorCounter.add(1, {
      environment: 'production',
      instance_name: instanceName,
    })
    process.exit(1)
  }
}
process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)
