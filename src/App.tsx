import { AppShell } from "./components/layout/AppShell";
import { AuthProvider } from "./context/AuthContext";
import { DemoProvider } from "./context/DemoContext";
import { NavigationProvider, useNavigation } from "./context/NavigationContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CandidateProfilePage } from "./pages/CandidateProfilePage";
import { ConsultantPage } from "./pages/ConsultantPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { MatchingPage } from "./pages/MatchingPage";
import { MessagesPage } from "./pages/MessagesPage";
import { MyWorkPage } from "./pages/MyWorkPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { ThesisPage } from "./pages/ThesisPage";
import { UserProfilePage } from "./pages/UserProfilePage";
import { WorkspacePage } from "./pages/WorkspacePage";

function CurrentPage() {
  const { page } = useNavigation();

  const pages = {
    landing: <LandingPage />,
    onboarding: <OnboardingPage />,
    login: <LoginPage />,
    register: <RegisterPage />,
    consultant: <ConsultantPage />,
    workspace: <WorkspacePage />,
    thesis: <ThesisPage />,
    matching: <MatchingPage />,
    myWork: <MyWorkPage />,
    candidate: <CandidateProfilePage />,
    user: <UserProfilePage />,
    messages: <MessagesPage />,
    profile: <ProfilePage />
  };

  return pages[page] ?? <LandingPage />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DemoProvider>
          <NavigationProvider>
            <AppShell>
              <CurrentPage />
            </AppShell>
          </NavigationProvider>
        </DemoProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
