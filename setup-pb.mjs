import { surveyQuestions } from './src/lib/config.js';

const PB_URL = 'http://127.0.0.1:8090';
const ADMIN_EMAIL = 'admin@healthmonitor.nl';
const ADMIN_PASSWORD = 'admin123456';

let adminToken = '';

async function api(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (adminToken) headers['Authorization'] = adminToken;

  const res = await fetch(`${PB_URL}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`${method} ${path}: ${res.status} ${JSON.stringify(err)}`);
  }

  return res.json().catch(() => ({}));
}

async function auth() {
  console.log('1. Authenticating as superuser...');
  try {
    const res = await api('POST', '/collections/_superusers/auth-with-password', {
      identity: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    adminToken = res.token;
    console.log('   Logged in.');
  } catch {
    console.log('   Superuser already exists, trying to login...');
    const res = await api('POST', '/collections/_superusers/auth-with-password', {
      identity: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    adminToken = res.token;
    console.log('   Logged in.');
  }
}

async function setup() {
  console.log('=== Agile Health Monitor — PocketBase Setup ===\n');
  await auth();

  console.log('\n2. Setting up users collection (adding username, team, admin fields + enabling username login)...');
  try {
    const usersCol = await api('GET', '/collections/users');
    const fields = usersCol.fields || [];
    const hasTeam = fields.some(f => f.name === 'team');
    const hasAdmin = fields.some(f => f.name === 'admin');
    const newFields = fields.filter(f => f.name !== 'username');
    newFields.push({ name: 'username', type: 'text', required: true, max: 50, unique: true });
    if (!hasTeam) newFields.push({ name: 'team', type: 'text', required: false, max: 500 });
    if (!hasAdmin) newFields.push({ name: 'admin', type: 'bool', required: false });

    try {
      await api('PATCH', '/collections/users', { fields: newFields });
    } catch (e) {
      // Fields may already be up-to-date
    }

    const updatedCol = await api('GET', '/collections/users');
    const usernameField = updatedCol.fields?.find(f => f.name === 'username');
    const hasUsernameIdentity = updatedCol.passwordAuth?.identityFields?.includes('username');

    console.log(usernameField ? '   "username" field ready.' : '   (username field pending — check PocketBase Admin)');

    if (!hasUsernameIdentity) {
      try {
        await api('PATCH', '/collections/users', {
          passwordAuth: { enabled: true, identityFields: ['username', 'email'] }
        });
        console.log('   Username login enabled.');
      } catch (e) {
        console.log('   NOTE: Enable username login via PocketBase Admin > Users > Settings > "Username"');
      }
    } else {
      console.log('   Username login enabled.');
    }
  } catch (err) {
    console.log('   Note:', err.message);
  }

  console.log('\n3. Creating "teams" collection...');
  await createCollection('teams', [
    { name: 'team', type: 'text', required: true, max: 50 },
    { name: 'created_by', type: 'text', required: false, max: 50 }
  ]);

  console.log('\n3b. Updating existing teams collection with created_by field...');
  try {
    const teamsCol = await api('GET', '/collections/teams');
    const teamsFields = teamsCol.fields || [];
    if (!teamsFields.some(f => f.name === 'created_by')) {
      teamsFields.push({ name: 'created_by', type: 'text', required: false, max: 50 });
      await api('PATCH', '/collections/teams', { fields: teamsFields });
      console.log('   created_by field added to teams.');
    } else {
      console.log('   created_by field already exists.');
    }
  } catch (err) {
    console.log('   Note:', err.message);
  }

  console.log('\n4. Creating "sprints" collection...');
  await createCollection('sprints', [
    { name: 'sprint', type: 'text', required: true, max: 50 },
    { name: 'team', type: 'text', required: true, max: 50 }
  ]);

  console.log('\n5. Creating "team_health" collection...');
  const healthFields = [
    { name: 'user', type: 'relation', required: false, collectionId: '_pb_users_auth_', maxSelect: 1 },
    { name: 'session', type: 'text', required: false, max: 50 },
    { name: 'voter_name', type: 'text', required: false, max: 50 },
    { name: 'team', type: 'text', required: true, max: 50 },
    { name: 'sprint', type: 'text', required: true, max: 50 }
  ];

  for (const q of surveyQuestions) {
    healthFields.push({ name: q.field, type: 'number', required: false, min: 1, max: 3 });
    healthFields.push({ name: q.field + '_comment', type: 'text', required: false, max: 500 });
  }

  await createCollection('team_health', healthFields);

  console.log('\n6. Creating "team_summary" collection...');
  const summaryFields = [
    { name: 'team', type: 'text', required: true, max: 50 },
    { name: 'sprint', type: 'text', required: true, max: 50 }
  ];
  for (const q of surveyQuestions) {
    summaryFields.push({ name: q.field, type: 'number', required: false });
  }
  await createCollection('team_summary', summaryFields);

  console.log('\n7. Creating "team_comments" collection...');
  const commentFields = [
    { name: 'sprint', type: 'text', required: true, max: 50 },
    { name: 'team', type: 'text', required: true, max: 50 }
  ];
  for (const q of surveyQuestions) {
    commentFields.push({ name: q.field + '_comment', type: 'text', required: false });
  }
  await createCollection('team_comments', commentFields);

  console.log('\n8. Creating "questions" collection...');
  await createCollection('questions', [
    { name: 'field', type: 'text', required: true, max: 100 },
    { name: 'question', type: 'text', required: true, max: 200 },
    { name: 'good', type: 'text', required: true, max: 1000 },
    { name: 'bad', type: 'text', required: true, max: 1000 },
    { name: 'order', type: 'number', required: true, min: 0 }
  ]);

  console.log('\n9. Creating "sessions" collection...');
  await createCollection('sessions', [
    { name: 'code', type: 'text', required: true, max: 6, min: 6 },
    { name: 'slug', type: 'text', required: true, max: 50 },
    { name: 'team', type: 'text', required: true, max: 50 },
    { name: 'sprint', type: 'text', required: true, max: 50 },
    { name: 'active', type: 'bool', required: false },
    { name: 'created_by', type: 'text', required: false, max: 50 }
  ]);

  console.log('\n10. Seeding questions...');
  await seedQuestions();

  console.log('\n11. Seeding teams...');
  await seedCollection('teams', [
    { team: 'Team Alpha' },
    { team: 'Team Beta' },
    { team: 'Team Gamma' }
  ], 'team');

  console.log('\n12. Seeding sprints...');
  const sprintData = [];
  const yy = new Date().getFullYear().toString().slice(2);
  const teamNames = ['Team Alpha', 'Team Beta', 'Team Gamma'];
  for (let i = 1; i <= 10; i++) {
    sprintData.push({ sprint: `S${yy}-${String(i).padStart(2, '0')}`, team: teamNames[(i-1) % 3] });
  }
  await seedCollection('sprints', sprintData, 'sprint');

  console.log('\n13. Opening access rules...');
  const publicCollections = ['teams', 'sprints', 'team_health', 'team_summary', 'team_comments', 'questions', 'sessions'];
  for (const name of publicCollections) {
    try {
      const col = await api('GET', `/collections/${name}`);
      await api('PATCH', `/collections/${name}`, {
        listRule: '',
        viewRule: '',
        createRule: '',
        updateRule: '',
        deleteRule: ''
      });
      console.log(`   ${name}: access opened.`);
    } catch (err) {
      console.log(`   ${name}: ${err.message}`);
    }
  }

  try {
    const usersCol = await api('GET', '/collections/users');
    try {
      await api('PATCH', '/collections/users', {
        listRule: '',
        viewRule: '',
        createRule: '',
        updateRule: 'id = @request.auth.id',
        deleteRule: 'id = @request.auth.id'
      });
      console.log('   users: access opened.');
    } catch {
      console.log('   users: access rules unchanged (already configured).');
    }
  } catch (err) {
    console.log(`   users: ${err.message}`);
  }

  console.log('\n=== Setup complete! ===');
  console.log(`Admin UI: ${PB_URL}/_/`);
  console.log(`Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log('\nStart the app: npm run dev');
  console.log('Open: http://localhost:5173');
}

async function seedQuestions() {
  for (let i = 0; i < surveyQuestions.length; i++) {
    const q = surveyQuestions[i];
    try {
      const existing = await api('GET', `/collections/questions/records?filter=(field='${q.field}')`);
      if (!(existing.items && existing.items.length > 0)) {
        await api('POST', '/collections/questions/records', {
          field: q.field, question: q.question, good: q.good, bad: q.bad, order: i + 1
        });
      }
    } catch { /* skip duplicates */ }
  }
  const count = await api('GET', '/collections/questions/records?perPage=1');
  console.log(`   questions: ${count.totalItems} records`);
}

async function createCollection(name, fields) {
  try {
    await api('POST', '/collections', {
      name,
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields
    });
    console.log(`   Created "${name}" collection with ${fields.length} fields.`);
  } catch (err) {
    if (err.message.includes('validation_collection_name_exists') || err.message.includes('400')) {
      console.log(`   "${name}" collection already exists.`);
    } else {
      console.log(`   Error creating "${name}": ${err.message}`);
    }
  }
}

async function seedCollection(name, data, uniqueField) {
  try {
    const existing = await api('GET', `/collections/${name}/records?perPage=100`);
    const existingItems = existing.items || [];
    const existingValues = new Set(existingItems.map(r => r[uniqueField]));

    let created = 0;
    for (const item of data) {
      if (!existingValues.has(item[uniqueField])) {
        await api('POST', `/collections/${name}/records`, item);
        created++;
      }
    }
    console.log(`   ${name}: ${created} new records added (${existingItems.length} already exist).`);
  } catch (err) {
    console.log(`   Error seeding "${name}": ${err.message}`);
  }
}

setup().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});
