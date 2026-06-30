const { Resend } = require('resend');

try {
  new Resend(undefined);
  console.log('Success');
} catch (e) {
  console.log('Error:', e.message);
}


