import { currentProfile } from "@/lib/current-profile";
import { auth } from "@clerk/nextjs/server";
import { useEffect } from "react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const profile = currentProfile();

    if (!profile) {
      return auth().redirectToSignIn();
    }
  }, []);

  return <>{children}</>;
};

export default ProtectedRoute;
