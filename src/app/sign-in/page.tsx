import { AuthUIContainer } from "@/components/AuthUIContainer";
import { SignIn } from "@clerk/nextjs/app-beta";

export default function Page() {
  return (
    <AuthUIContainer>
      <SignIn
        signUpUrl="/sign-up"
        afterSignUpUrl={"/?after=signup"}
        afterSignInUrl={"/?after=signup"}
      />
    </AuthUIContainer>
  );
}
