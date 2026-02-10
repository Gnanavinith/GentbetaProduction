export const API = (url, data, token) =>
  fetch(`${process.env.API_BASE_URL || 'https://app.matapangtech.com'}${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : ""
    },
    body: JSON.stringify(data)
  }).then(res => res.json());