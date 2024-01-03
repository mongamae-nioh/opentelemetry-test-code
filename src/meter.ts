import {
  ConsoleMetricExporter,
  PeriodicExportingMetricReader,
  MeterProvider,
} from '@opentelemetry/sdk-metrics'
import { MetricExporter } from '@google-cloud/opentelemetry-cloud-monitoring-exporter'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { Resource } from '@opentelemetry/resources'
// import { Counter } from '@opentelemetry/api-metrics'
import { GcpDetectorSync } from '@google-cloud/opentelemetry-resource-util'
import { isProduction } from './app'

const exporter = isProduction
  ? new MetricExporter()
  : new ConsoleMetricExporter()

// https://azukiazusa.dev/blog/instrumenting-Node-js-applications-with-open-telemetry/
// MeterProvider は Meter を生成するためのエントリーポイント
const meterProvider: MeterProvider = new MeterProvider({
  // resource は必須
  // ここではサービス名を指定している
  resource: new Resource({
    // OpenTelemetry では SemanticConventions として予め語彙が定義されている。
    // https://opentelemetry.io/docs/concepts/semantic-conventions/
    [SemanticResourceAttributes.SERVICE_NAME]: 'basic-metric-service',
  }).merge(new GcpDetectorSync().detect()),
})

// MeterProvider は設定を保持する役割を担う
meterProvider.addMetricReader(
  new PeriodicExportingMetricReader({
    exporter,
    exportIntervalMillis: 10_000,
  }),
)

// MeterProvider から Meter を生成する
const meter = meterProvider.getMeter('example-exporter-collector')

// Meter から Instrument を生成する
// ここでは Instrument の種類として Counter を使用する
export const requestCounter = meter.createCounter('req counter', {
  description: 'request counter of endpoint',
})

export const errorCounter = meter.createCounter('error counter', {
  description: 'error counter of endpoint',
})