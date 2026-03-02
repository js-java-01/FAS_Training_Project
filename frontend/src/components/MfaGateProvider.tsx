import { useEffect, useState } from "react";
import mfaGate from "@/api/mfaGate";
import axiosInstance from "@/api/axiosInstance";
import { MfaPromptModal } from "@/components/MfaPromptModal";

export function MfaGateProvider() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const unsubscribe = mfaGate.subscribe(() => {
      if (mfaGate.hasPendingRequests()) {
        setShowModal(true);
      }
    });
    return unsubscribe;
  }, []);

  const handleStepUpSuccess = () => {
    setShowModal(false);
    mfaGate.resolveAll((config) => axiosInstance(config as any));
  };

  const handleCancel = () => {
    setShowModal(false);
    mfaGate.rejectAll(new Error("MFA verification cancelled"));
  };

  return (
    <MfaPromptModal
      open={showModal}
      onStepUpSuccess={handleStepUpSuccess}
      onCancel={handleCancel}
    />
  );
}
