const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export function signInWithGoogle(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!GOOGLE_CLIENT_ID) {
      reject(new Error("Google client ID is not configured."));
      return;
    }

    const redirectUri = `${window.location.origin}/google-callback`;
    const nonce = Math.random().toString(36).substring(2);

    const url =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `response_type=id_token&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=openid%20email%20profile&` +
      `nonce=${nonce}`;

    const popup = window.open(url, "google-signin", "width=500,height=600");

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "google-idtoken" && event.data?.idToken) {
        window.removeEventListener("message", handleMessage);
        clearInterval(checkInterval);
        resolve(event.data.idToken);
      }
    };

    window.addEventListener("message", handleMessage);

    const checkInterval = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkInterval);
        window.removeEventListener("message", handleMessage);
        reject(new Error("Google sign-in was cancelled."));
      }
    }, 500);
  });
}
