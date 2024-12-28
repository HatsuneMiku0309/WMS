function t2() {
  const p = fetch("http://localhost:3000/api/login", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "account": "cosmo_dai",
      "password": "abcd"
  })
  })
  .then((res) => {
    const reader = res.body.getReader();
    reader.read
  }).catch((err) => {
    // console.error(err);
  });
  throw p;
}

function test () {
  try {
    t2()
  } catch (err) {
    if (err instanceof Promise) {
      err.finally(() => {
        console.log('fail');
      });
    }
  }

  console.log('test end');
}

try {
  test();
} catch (err) {

}