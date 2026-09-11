import { AppShell } from "./components/layout/AppShell";
import { AuthProvider } from "./context/AuthContext";
import { DemoProvider } from "./context/DemoContext";
import { NavigationProvider, useNavigation } from "./context/NavigationContext";
import { ConsultantPage } from "./pages/ConsultantPage";
import { LoginPage } from "./pages/LoginPage";
import { MatchingPage } from "./pages/MatchingPage";
import { MessagesPage } from "./pages/MessagesPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ThesisPage } from "./pages/ThesisPage";
import { WorkspacePage } from "./pages/WorkspacePage";

function CurrentPage() {
  const { page } = useNavigation();

  const pages = {
    onboarding: <OnboardingPage />,
    login: <LoginPage />,
    consultant: <ConsultantPage />,
    workspace: <WorkspacePage />,
    thesis: <ThesisPage />,
    matching: <MatchingPage />,
    messages: <MessagesPage />,
    profile: <ProfilePage />
  };

  return pages[page] ?? <OnboardingPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <DemoProvider>
        <NavigationProvider>
          <AppShell>
            <CurrentPage />
          </AppShell>
        </NavigationProvider>
      </DemoProvider>
    </AuthProvider>
  );
}
