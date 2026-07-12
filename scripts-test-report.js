const base = 'http://localhost:3000';
const cookieJar = [];
function addCookies(header) {
  if (!header) return;
  header.split(',').forEach(c => {
    const kv = c.split(';')[0].trim();
    if (kv && !cookieJar.includes(kv)) cookieJar.push(kv);
  });
}
async function doRequest(path, options = {}) {
  options.headers = options.headers || {};
  if (cookieJar.length) options.headers['Cookie'] = cookieJar.join('; ');
  if (options.body && typeof options.body === 'object' && !options.body.pipe && !(options.body instanceof URLSearchParams) && !(options.body instanceof FormData)) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }
  const res = await fetch(base + path, options);
  addCookies(res.headers.get('set-cookie'));
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch (e) { data = text; }
  return { status: res.status, data, headers: Object.fromEntries([...res.headers]) };
}
(async () => {
  console.log('Registering...');
  let r = await doRequest('/api/auth/register', { method: 'POST', body: { username: 'reporttestuser3', email: 'reporttestuser3@example.com', password: 'Test1234!' } });
  console.log(r.status, r.data);
  console.log('Generating report...');
  const form = new FormData();
  form.append('jobDescription', 'Senior Frontend Engineer required React, TypeScript, and API integration.');
  form.append('selfDescription', 'I have 5 years of experience building React apps.');
  const res2 = await fetch(base + '/api/interview/', {
    method: 'POST',
    body: form,
    headers: { Cookie: cookieJar.join('; ') }
  });
  const txt = await res2.text();
  console.log('status', res2.status);
  console.log(txt);
})();
