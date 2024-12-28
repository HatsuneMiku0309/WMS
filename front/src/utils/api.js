import axios from 'axios';

const instance = axios.create({
  baseURL: `http://${window.location.hostname}:3000/api`,
  withCredentials: true,
  // headers: {
  //   'Content-Type': 'application/json'
  // }
});

async function get (url, config = {}) {
  try {
    let res = await instance.get(url, config);
    return res;
  } catch (err) {
    const message = 'data' in err.response ? typeof err.response.data === 'object' && 'errMsg' in err.response.data ? err.response.data.errMsg : err.response.data : err.message
    err.c_message = message;
    throw err;
  }
}

async function post (url, data, config = {}) {
  try {
    let res = await instance.post(url, data, config);
    return res;
  } catch (err) {
    const message = 'data' in err.response ? typeof err.response.data === 'object' && 'errMsg' in err.response.data ? err.response.data.errMsg : err.response.data : err.message
    err.c_message = message;
    throw err;
  }
}

async function put (url, data, config = {}) {
  try {
    let res = await instance.put(url, data, config);
    return res;
  } catch (err) {
    const message = 'data' in err.response ? typeof err.response.data === 'object' && 'errMsg' in err.response.data ? err.response.data.errMsg : err.response.data : err.message
    err.c_message = message;
    throw err;
  }
}

async function del (url, data, config = {}) {
  try {
    let res = await instance.delete(url, {
      data: data,
      ...config
    });
    return res;
  } catch (err) {
    const message = 'data' in err.response ? typeof err.response.data === 'object' && 'errMsg' in err.response.data ? err.response.data.errMsg : err.response.data : err.message
    err.c_message = message;
    throw err;
  }
}

export {
  get,
  post,
  put,
  del
}