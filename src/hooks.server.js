import PocketBase from 'pocketbase';
import { loadQuestions } from '$lib/config.js';

const PB_URL = process.env.PB_URL || import.meta.env.VITE_POCKETBASE_PUBLIC_URL || 'http://127.0.0.1:8090';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  event.locals.pb = new PocketBase(PB_URL);

  event.locals.pb.authStore.loadFromCookie(
    event.request.headers.get('cookie') || ''
  );

  try {
    if (event.locals.pb.authStore.isValid && event.locals.pb.authStore.model) {
      event.locals.user = structuredClone(event.locals.pb.authStore.model);
      event.locals.isAdmin = event.locals.pb.authStore.model.admin === true;
    }
  } catch {
    event.locals.user = null;
  }

  const savedCookie = event.locals.pb.authStore.exportToCookie({
    secure: false,
    sameSite: 'Lax',
    httpOnly: false
  });

  event.locals.questions = await loadQuestions(event.locals.pb);

  const response = await resolve(event);

  const pbCookie = event.locals.pb.authStore.exportToCookie({
    secure: false,
    sameSite: 'Lax',
    httpOnly: false
  });

  if (pbCookie) {
    response.headers.append('set-cookie', pbCookie);
  } else if (savedCookie) {
    response.headers.append('set-cookie', savedCookie);
  }

  return response;
}
