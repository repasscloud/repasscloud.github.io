// Worker entry for deployments that use Workers static assets (wrangler.toml)
// instead of Cloudflare Pages. Serves /api/contact and hands everything else
// to the static site in dist/. Pages deployments use functions/ instead and
// ignore this file.
import { contactEndpoint, type ContactEnv } from './contact';

interface Env extends ContactEnv {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/contact' || url.pathname === '/api/contact/') {
      return contactEndpoint(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
