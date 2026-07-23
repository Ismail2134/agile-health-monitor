import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
    csrf: {
      trustedOrigins: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://health.agiledevops.nl'
      ]
    }
  }
};

export default config;
