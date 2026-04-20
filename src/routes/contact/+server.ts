import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

const RELAY_URL = 'https://sheetmagnet-production.up.railway.app/contact';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();

  const response = await fetch(RELAY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Contact-Token': env.CONTACT_TOKEN ?? '',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return json(data, { status: response.status });
};
