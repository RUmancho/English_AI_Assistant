import { AppShell } from "@/components/AppShell";
import { LearningProvider } from "@/context/LearningContext";

export default function Home() {
  return (
    <LearningProvider>
      <AppShell />
    </LearningProvider>
  );
}
