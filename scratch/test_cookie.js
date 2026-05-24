const { createServerClient } = require("@supabase/ssr");

const supabaseUrl = "https://okoqgrrspwxaonbyfkxf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rb3FncnJzcHd4YW9uYnlma3hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MTEwMDYsImV4cCI6MjA5NTE4NzAwNn0.LdIq9S8h7pW9MQpxcPRv6xOheA-CCv7l2ODy598BGRQ";

// Helper to create a base64 encoded JWT with role "authenticated"
function createMockJWT(role = "authenticated") {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    iss: "supabase",
    ref: "okoqgrrspwxaonbyfkxf",
    role: role,
    email: "testuser@example.com",
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000)
  };
  
  const b64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
  const b64Payload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${b64Header}.${b64Payload}.signature`;
}

const jwt = createMockJWT("authenticated");

const mockSession = {
  access_token: jwt,
  refresh_token: "mock_refresh_token",
  user: { id: "mock_user_id", email: "testuser@example.com" }
};

const rawJsonValue = JSON.stringify(mockSession);

const supabase = createServerClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    cookies: {
      get(name) {
        console.log(`get() called for name: ${name}`);
        if (name === "sb-okoqgrrspwxaonbyfkxf-auth-token") {
          return rawJsonValue;
        }
        return null;
      },
      set(name, value, options) {
        console.log(`set() called for name: ${name}`);
      },
      remove(name, options) {
        console.log(`remove() called for name: ${name}`);
      },
      getAll() {
        console.log("getAll() called");
        return [];
      },
      setAll() {
        console.log("setAll() called");
      }
    }
  }
);

supabase.auth.getSession().then(({ data, error }) => {
  console.log("SESSION RESULT:", data.session ? "SUCCESS" : "null");
}).catch(err => {
  console.error("CRASH ERROR:", err);
});
