# Public API

StreamStory exposes a versioned HTTP API under `/api/v1` for building models and
classifying data programmatically. The interactive reference (OpenAPI 3.0) is
served by the running instance at:

```
http://<host>/api/v1/docs
```

## Authentication

Every request must carry an API key in the `x-api-key` header. Keys are issued
per user account and managed from the StreamStory web app.

```
x-api-key: <your-api-key>
```

Missing key → `400`; invalid key → `401`.

> The default deployment is served over plain HTTP, so the `x-api-key` header
> travels unencrypted. Use it only over a trusted network, and put the instance
> behind HTTPS if it is publicly reachable.

## Endpoints

Base path: `/api/v1`

| Method   | Path                          | Description |
|----------|-------------------------------|-------------|
| `GET`    | `/models`                     | List your models. |
| `GET`    | `/models/{uuid}`              | Get a single model by its UUID. |
| `DELETE` | `/models/{uuid}`              | Delete a model. |
| `POST`   | `/models/build`               | Build a new model from a dataset (JSON body). |
| `POST`   | `/models/{uuid}/classification` | Classify data points against an existing model (JSON body). |

Request and response schemas for the `POST` endpoints are documented in full at
`/api/v1/docs`.

## Example

```bash
curl -s http://<host>/api/v1/models \
  -H "x-api-key: $STREAMSTORY_API_KEY"
```

Replace `<host>` with your deployment (e.g. `streamstory.ijs.si`) and
`$STREAMSTORY_API_KEY` with your key.
