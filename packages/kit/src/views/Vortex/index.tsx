import { VortexAccountProvider } from './components/withVortexAccount';
import Dashboard from './pages/Dashboard';

export default function Vortex() {
  return (
    <VortexAccountProvider>
      <Dashboard />
    </VortexAccountProvider>
  );
}
