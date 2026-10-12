# Low-memory production deployment

Use this repository's Dockerfile and one running replica. In Dokploy Advanced > Resources set Memory Limit to **268435456 bytes (256 MiB)**, then redeploy. The backend budget is 208 MiB; both containers total 464 MiB (486539264 bytes), below 500 MB.

Set INTERNAL_API_URL to http://YOUR_BACKEND_SERVICE_NAME:5000 on the same Docker network. Preserve existing public environment settings and domains. The runner sets NODE_OPTIONS=--max-old-space-size=96 --max-semi-space-size=2 and UV_THREADPOOL_SIZE=2. Update any existing Dokploy NODE_OPTIONS override to match. npm start also sets these heap limits. Use production builds; build memory is outside the runtime budget.

Next caches use disk and proxy responses stream to clients. Runtime image conversion is disabled; original assets are served and may use more bandwidth when the originals are large.

Local Windows/Node 24 testing with the backend handled 1050 requests at concurrency 20 while streaming a synthetic 256 MiB backup: combined peak process RSS was about 338 MB. Docker/Linux Node 22 was not available for local container measurement. Verify actual container usage after deployment. Run node proxy-streaming.test.cjs to verify streaming/authentication/receipt protection.

Dokploy resource values are raw bytes: https://docs.dokploy.com/docs/core/applications/advanced
