# How to start local environment
```bash
docker-compose up -d
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT='http://localhost:4318/v1/traces'
export OTEL_SERVICE_NAME="otel-test"
npm run dev
```


# How to deploy to Cloud Run
```bash
gcloud run deploy --source . --set-env-vars=SERVER2='https://<server2>' --max-instances=2
```