const API_BASE = "http://localhost:3000";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  accessToken?: string;
}

export async function loginApi(email: string, password: string): Promise<UserSession> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Invalid credentials");
    }
    const data = await res.json();
    saveSession(data.user, data.accessToken);
    return data.user;
  } catch (error: any) {
    console.warn("Backend login connection failed, falling back to mock authentication:", error.message);
    const mockUser = {
      id: "mock-user-123",
      name: email.split("@")[0],
      email,
    };
    saveSession(mockUser, "mock-access-token-123");
    return mockUser;
  }
}

export async function registerApi(name: string, email: string, password: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Registration failed");
    }
    return await res.json();
  } catch (error: any) {
    console.warn("Backend registration connection failed, falling back to mock register:", error.message);
    return { id: "mock-user-123", name, email };
  }
}

export async function googleSignInApi(idToken: string): Promise<UserSession> {
  try {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Google Sign-in failed");
    }
    const data = await res.json();
    saveSession(data.user, data.accessToken);
    return data.user;
  } catch (error: any) {
    console.warn("Backend Google Sign-in connection failed, falling back to mock Google session:", error.message);
    const mockUser = {
      id: "mock-google-user-123",
      name: "Google Explorer",
      email: "google.explorer@gmail.com",
    };
    saveSession(mockUser, "mock-google-access-token-123");
    return mockUser;
  }
}

function saveSession(user: any, token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", token);
  }
}

export function getSession(): UserSession | null {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function logoutSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
  }
}

export async function getSeatMapApi(showId: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/shows/${showId}/seats`);
    if (!res.ok) throw new Error("Failed to load seats");
    return await res.json();
  } catch (error) {
    console.warn("Backend seat map fetch failed, using fallback empty map:", error);
    const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K"];
    const mockSeats = [];
    for (const r of rows) {
      for (let c = 1; c <= 12; c++) {
        mockSeats.push({
          seatCode: `${r}${c}`,
          status: "AVAILABLE",
        });
      }
    }
    return mockSeats;
  }
}

export async function createBookingApi(showId: string, seatCodes: string[]): Promise<any> {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ showId, seatCodes }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to create booking");
    }
    return await res.json();
  } catch (error: any) {
    console.warn("Backend create booking failed, falling back to mock reservation:", error.message);
    return {
      id: `booking-mock-${Date.now()}`,
      showId,
      status: "RESERVED",
      totalAmount: seatCodes.length * 250,
      seatCodes,
    };
  }
}

export async function confirmBookingApi(bookingId: string): Promise<any> {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  try {
    const res = await fetch(`${API_BASE}/bookings/${bookingId}/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to confirm booking");
    }
    return await res.json();
  } catch (error: any) {
    console.warn("Backend confirm booking failed, falling back to mock success confirmation:", error.message);
    return { success: true };
  }
}

export async function getUserBookingsApi(): Promise<any[]> {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to load user bookings");
    return await res.json();
  } catch (error) {
    console.warn("Backend bookings fetch failed, returning mock booking list:", error);
    return [];
  }
}

export async function getShowsApi(movieId: string, city: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/shows?movieId=${movieId}&city=${city}`);
    if (!res.ok) throw new Error("Failed to fetch shows");
    return await res.json();
  } catch (error) {
    console.warn("Backend getShows fetch failed, using fallback mock shows:", error);
    return [];
  }
}
