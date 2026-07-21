import http from "k6/http";
import { check } from "k6";
import { Counter } from "k6/metrics";

export const options = {
  scenarios: {
    concurrency_stress: {
      executor: "per-vu-iterations",
      vus: 20,
      iterations: 1,
      maxDuration: "30s",
    },
  },
};

const successCounter = new Counter("successful_bookings");
const conflictCounter = new Counter("conflict_bookings");
const queuedCounter = new Counter("queued_bookings");
const otherErrorCounter = new Counter("other_errors");

const BASE_URL = "http://localhost:3000";

// Setup: Register and authenticate users to get JWT tokens
export function setup() {
  console.log("k6 Setup: Registering and authenticating 20 virtual users...");
  const tokens = [];

  for (let i = 1; i <= 20; i++) {
    const email = `k6-user-${Date.now()}-${i}@example.com`;
    const password = "Password123";

    // 1. Register user
    const regRes = http.post(
      `${BASE_URL}/auth/register`,
      JSON.stringify({ email, password }),
      { headers: { "Content-Type": "application/json" } }
    );

    if (regRes.status === 201) {
      // 2. Login user to get access token
      const loginRes = http.post(
        `${BASE_URL}/auth/login`,
        JSON.stringify({ email, password }),
        { headers: { "Content-Type": "application/json" } }
      );

      if (loginRes.status === 201 || loginRes.status === 200) {
        const body = JSON.parse(loginRes.body);
        tokens.push(body.accessToken);
      }
    }
  }

  console.log(`k6 Setup: Successfully authenticated ${tokens.length} users.`);

  // Get active show ID
  const showRes = http.get(`${BASE_URL}/shows`);
  let showId = "";
  if (showRes.status === 200) {
    const shows = JSON.parse(showRes.body);
    if (shows.length > 0) {
      showId = shows[0].id;
    }
  }

  return { tokens, showId };
}

export default function (data) {
  const { tokens, showId } = data;
  const token = tokens[__VU - 1]; // __VU is 1-indexed

  if (!token) {
    console.log(`VU ${__VU}: No JWT token available.`);
    return;
  }

  if (!showId) {
    console.log(`VU ${__VU}: No show ID available.`);
    return;
  }

  const payload = JSON.stringify({
    showId: showId,
    seatCodes: ["A01"],
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "x-bypass-waiting-room": "test-bypass-secret",
    },
  };

  const response = http.post(`${BASE_URL}/bookings`, payload, params);

  if (response.status === 201) {
    successCounter.add(1);
    console.log(`VU ${__VU}: SUCCESS booking seat A01!`);
  } else if (response.status === 409) {
    conflictCounter.add(1);
    console.log(`VU ${__VU}: CONFLICT (Expected lock fast-fail)`);
  } else if (response.status === 429) {
    queuedCounter.add(1);
    console.log(`VU ${__VU}: QUEUED (Waiting Room active)`);
  } else {
    otherErrorCounter.add(1);
    console.log(`VU ${__VU}: Unexpected Status Code ${response.status} - ${response.body}`);
  }

  check(response, {
    "status is 201 or 409": (r) => r.status === 201 || r.status === 409,
  });
}
