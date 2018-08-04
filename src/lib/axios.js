import axios from 'axios';
import config from '../util/config';

const ax = axios.create({
  timeout: 3000,
  withCredentials: false,
  // baseURL: config.address
});
ax.interceptors.response.use(
  res => res,
  err => {
    if (err.message && err.message.match(/timeout/)) {
      const config = err.config;
      if (config.method !== 'get') return Promise.reject(err); // only retry GET methods
      if (config.leftRetry) config.leftRetry--;
      else config.leftRetry = 3; // default retry times

      if (config.leftRetry) {
        return ax(config);
      } else {
        return Promise.reject(err);
      }
    }
    return Promise.reject(err);
  }
);

export default ax;
