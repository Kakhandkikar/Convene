import axios from 'axios';
import { env } from './env.js';

let cachedToken = null;
let tokenExpiry = 0;

export async function getZoomAccessToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry - 60_000) return cachedToken;
  const url = 'https://zoom.us/oauth/token';
  const params = new URLSearchParams({
    grant_type: 'account_credentials',
    account_id: env.zoom.accountId,
  });
  const basic = Buffer.from(`${env.zoom.clientId}:${env.zoom.clientSecret}`).toString('base64');
  const { data } = await axios.post(`${url}?${params.toString()}`, null, {
    headers: { Authorization: `Basic ${basic}` }
  });
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000);
  return cachedToken;
}

export async function createZoomMeeting({ topic, start_time, duration = 30, timezone = 'UTC' }) {
  const token = await getZoomAccessToken();
  const { data } = await axios.post(
    `https://api.zoom.us/v2/users/${encodeURIComponent(env.zoom.hostUser)}/meetings`,
    {
      topic,
      type: 2,
      start_time,
      duration,
      timezone,
      settings: {
        approval_type: 2,
        join_before_host: true,
        waiting_room: false,
        mute_upon_entry: true,
      }
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return {
    id: data.id,
    uuid: data.uuid,
    start_url: data.start_url,
    join_url: data.join_url,
    password: data.password || null,
  };
}
