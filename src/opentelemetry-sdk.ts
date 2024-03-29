import { NodeSDK } from '@opentelemetry/sdk-node'
// import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node'
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
  View,
  Aggregation,
  InstrumentType,
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
import {
  ExpressInstrumentation,
  ExpressLayerType,
} from '@opentelemetry/instrumentation-express'
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
    exportIntervalMillis: 10_000,
    exporter: exporter
  }),
  views: [
    new View({
      aggregation: Aggregation.ExponentialHistogram(),
      instrumentType: InstrumentType.HISTOGRAM,
    }),
  ],
  // resource: new GcpDetectorSync().detect(),
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation({
      ignoreLayersType: [
        ExpressLayerType.MIDDLEWARE,
        ExpressLayerType.REQUEST_HANDLER,
      ],
    }),
    new WinstonInstrumentation(),
  ],
  textMapPropagator: new W3CTraceContextPropagator(),
})

openTelemetrySDK.start()
