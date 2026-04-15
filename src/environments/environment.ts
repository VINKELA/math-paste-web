const local = 'http://localhost:8000/api';
const dev = 'https://api.mathpaste.com/api';

const url = dev; // Switch between 'local' and 'dev' as needed
const api = url + '/';
export const environment = {
  production: false,
  api: api,
  url: url,
}
