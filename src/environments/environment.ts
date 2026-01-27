const local = 'http://localhost:8000/api';
const dev = 'https://math-paste-api.onrender.com/api';

const url = dev; // Switch between 'local' and 'dev' as needed
const api = url + '/';
export const environment = {
  production: false,
  api: api,
  url: url,
}
