import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { SettingsPanel } from '../components/settings/SettingsPanel';
import { useBackendStatus } from '../hooks/useBackendStatus';
import { useCamera } from '../hooks/useCamera';
import { Settings, ShieldCheck } from 'lucide-react';

interface SettingsPageProps {
  isMockMode: boolean;
  onToggleMockMode: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  isMockMode,
  onToggleMockMode,
}) => {
  const { isOnline, latencyMs, refetch } = useBackendStatus(10000);
  const { devices, selectedDeviceId, switchDevice } = useCamera();

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Settings & System Configuration"
        subtitle="Manage local hardware preferences, backend connection endpoints, speech playback, and data privacy."
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F0F2F3] text-[#252720]">
            <Settings className="w-3.5 h-3.5 text-[#747873]" />
            <span>Preferences</span>
          </span>
        }
      />

      <SettingsPanel
        isOnline={isOnline}
        latencyMs={latencyMs}
        devices={devices}
        selectedDeviceId={selectedDeviceId}
        isMockMode={isMockMode}
        onSwitchDevice={switchDevice}
        onToggleMockMode={onToggleMockMode}
        onRefetchStatus={refetch}
      />
    </div>
  );
};

