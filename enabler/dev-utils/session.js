const projectKey = __VITE_CTP_PROJECT_KEY__;

const fetchAdminToken = async () => {
  const myHeaders = new Headers();

  myHeaders.append('Authorization', `Basic ${btoa(`${__VITE_CTP_CLIENT_ID__}:${__VITE_CTP_CLIENT_SECRET__}`)}`);
  myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

  var urlencoded = new URLSearchParams();
  urlencoded.append('grant_type', 'client_credentials');
  //urlencoded.append('scope', __VITE_ADMIN_SCOPE__);

  const response = await fetch(`${__VITE_CTP_AUTH_URL__}/oauth/token`, {
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
  console.log("Token fetched:", token)
  return token.access_token;
}

const getSessionId = async(cartId) => {
  const accessToken = await fetchAdminToken();

  const sessionMetadata = {
    allowedPaymentMethods: ['card'], // add here your allowed methods for development purposes
  };

  const url = `${__VITE_CTP_SESSION_URL__}/${projectKey}/sessions`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      cart: {
        cartRef: {
          id: cartId,
        }
      },
      metadata: sessionMetadata,
    }),
  });
  const data = await res.json();

  if (!res.ok) {
    console.error("Not able to create session:", url, data)
    throw new Error("Not able to create session")
  }

  console.log("Session created:", data)
  return data.id;
}
