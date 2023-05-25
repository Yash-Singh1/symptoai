import { AuthUIContainer } from "@/components/AuthUIContainer";
import { SignUp } from "@clerk/nextjs/app-beta";

export default function Page() {
  return (
    <AuthUIContainer>
      <SignUp
        signInUrl="/sign-in"
        afterSignUpUrl={"/?after=signup"}
        afterSignInUrl={"/?after=signup"}
      />
    </AuthUIContainer>
  );
}
