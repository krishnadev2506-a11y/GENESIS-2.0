async function test() {
  const API_KEY = 'xkeysib-' + '76d96273a21ccd8f766ef05755f41e24ff0065197607dc019c9e67615fdb2430-' + 'CD374osjNCkJOYxc';
  
  const payload = {
    sender: { name: "GENESIS 2.0", email: "krishnadev2506@gmail.com" },
    to: [{ email: "someothertestemail999@gmail.com" }],
    subject: "Genesis 2.0 - External Test",
    htmlContent: "<html><body><p>Testing external email</p></body></html>",
    textContent: "Testing external email"
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  console.log('Status:', response.status);
  const text = await response.text();
  console.log('Response:', text);
}

test();
