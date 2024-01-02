import { NodeSDK } from '@opentelemetry/sdk-node'
// import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node'
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics'
import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter'
import {
  BatchSpanProcessor,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base'
import { MetricExporter } from '@google-cloud/opentelemetry-cloud-monitoring-exporter'
import { isProduction } from './app'
import { W3CTraceContextPropagator } from '@opentelemetry/core'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express'
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'

const traceExporter = isProduction
  ? new TraceExporter()
  : new OTLPTraceExporter()
const spanProcessor = isProduction
  ? new BatchSpanProcessor(traceExporter)
  : new SimpleSpanProcessor(traceExporter)
const exporter = isProduction
  ? new MetricExporter()
  : new ConsoleMetricExporter()

export const openTelemetrySDK = new NodeSDK({
  traceExporter,
  spanProcessor,
  metricReader: new PeriodicExportingMetricReader({
    exporter: exporter,
  }),
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new WinstonInstrumentation(),
  ],
  textMapPropagator: new W3CTraceContextPropagator(),
})

openTelemetrySDK.start()