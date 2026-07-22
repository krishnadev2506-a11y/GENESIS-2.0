async function test() {
  const API_KEY = 'xkeysib-' + '76d96273a21ccd8f766ef05755f41e24ff0065197607dc019c9e67615fdb2430-' + 'CD374osjNCkJOYxc';
  
  const response = await fetch('https://api.brevo.com/v3/smtp/statistics/events?messageId=<202607220842.25856279848@smtp-relay.mailin.fr>', {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'api-key': API_KEY
    }
  });

  const text = await response.text();
  console.log('Response:', text);
}

test();
