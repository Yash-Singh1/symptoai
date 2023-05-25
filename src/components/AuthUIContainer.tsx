export function AuthUIContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex justify-center items-center">
      {children}
    </div>
  );
}
