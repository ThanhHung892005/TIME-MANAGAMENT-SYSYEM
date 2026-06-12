fetch('http://localhost:3001/api/auth/send-register-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'ghepus7@gmail.com' })
})
.then(r => r.json().then(data => ({ status: r.status, data })))
.then(console.log)
.catch(console.error);
