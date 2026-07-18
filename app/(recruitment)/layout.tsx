// Auth/session wrapping (getSession + RecruitmentNavbar) lands here in M2.
// Trivial passthrough for now, just to prove the route group + design system render.
export default function RecruitmentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen">{children}</div>;
}
