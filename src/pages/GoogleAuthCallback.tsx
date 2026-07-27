import { useEffect } from "react";

export default function GoogleAuthCallback() {
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const idToken = params.get("id_token");
    if (idToken && window.opener) {
      window.opener.postMessage(
        { type: "google-idtoken", idToken },
        window.location.origin
      );
    }
    window.close();
  }, []);

  return <div style={{ padding: 40, textAlign: "center" }}>Completing sign-in...</div>;
}
