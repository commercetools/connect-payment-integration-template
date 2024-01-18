const projectKey = 'commercetools-checkout';

const fetchAdminToken = async () => {
  const myHeaders = new Headers();

  myHeaders.append('Authorization', `Basic ${btoa(`${__VITE_ADMIN_CLIENT_ID__}:${__VITE_ADMIN_CLIENT_SECRET__}`)}`);
  myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

  var urlencoded = new URLSearchParams();
  urlencoded.append('grant_type', 'client_credentials');
  urlencoded.append('scope', __VITE_ADMIN_SCOPE__);

  const response = await fetch(`https://auth.${__VITE_REGION__}.commercetools.com/oauth/token`, {
    body: urlencoded,
    headers: myHeaders,
    method: 'POST',
    redirect: 'follow',
  });

  const token = await response.json();

  if (response.status !== 200) {
    console.log({
      title: 'Token fetch failed',
      message: `Error ${response.status} while fetching token`,
    });
    return;
  } else {
    console.log({
      title: 'Token fetched',
      message: `Token fetched: ${token.access_token}`,
    });
  }
  return token.access_token;
}

const getSessionId = async() => {
  const accessToken = await fetchAdminToken();

  const sessionMetadata = {
    cartId: '',
    allowedPaymentMethods: ['card', 'ideal', 'googlepay'],
  };

  const res = await fetch(`http://localhost:3004/api/${projectKey}/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      metadata: sessionMetadata,
    }),
  });
  const data = await res.json();
  return data.id;
}
