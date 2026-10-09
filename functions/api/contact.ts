// Cloudflare Pages Function: POST /api/contact
// Logic lives in cloudflare/contact.ts so the Worker entry can share it.
import { contactEndpoint, type ContactEnv } from '../../cloudflare/contact';

interface PagesContext {
  request: Request;
  env: ContactEnv;
}

export const onRequestPost = (context: PagesContext) => contactEndpoint(context.request, context.env);

export const onRequest = (context: PagesContext) => contactEndpoint(context.request, context.env);
