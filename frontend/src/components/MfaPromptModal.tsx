import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import mfaApi from "@/api/mfaApi";

interface MfaPromptModalProps {
  open: boolean;
  onStepUpSuccess: () => void;
  onCancel: () => void;
}

export function MfaPromptModal({ open, onStepUpSuccess, onCancel }: MfaPromptModalProps) {
  const [isSetupMode, setIsSetupMode] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true);

  useEffect(() => {
    console.log("MfaPromptModal open changed:", open);
    if (open) {
      checkMfaStatus();
    } else {
      resetState();
    }
  }, [open]);

  const resetState = () => {
    setIsSetupMode(false);
    setIsInitialized(false);
    setQrCodeUrl("");
    setCode("");
    setLoading(false);
    setError("");
    setCheckingStatus(true);
  };

  const checkMfaStatus = async () => {
    try {
      setCheckingStatus(true);
      setError("");
      console.log("Checking MFA status...");
      const status = await mfaApi.status();
      console.log("MFA status received:", status);
      setIsSetupMode(!status.success);
      console.log("Setup mode:", !status.success);
    } catch (err) {
      console.error("Failed to check MFA status:", err);
      setError("Failed to check MFA status");
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleInitializeMfa = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Initializing MFA...");
      const response = await mfaApi.init();
      console.log("MFA initialized, QR code URL:", response.qrCodeUrl);
      setQrCodeUrl(response.qrCodeUrl);
      setIsInitialized(true);
    } catch (err) {
      console.error("Failed to initialize MFA:", err);
      setError("Failed to initialize MFA");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSetup = async () => {
    if (!code.trim()) {
      setError("Please enter the verification code");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await mfaApi.confirmSetup(code);
      onStepUpSuccess();
      resetState();
    } catch (err) {
      setError("Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyStepUp = async () => {
    if (!code.trim()) {
      setError("Please enter the verification code");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await mfaApi.verifyStepUp(code);
      onStepUpSuccess();
      resetState();
    } catch (err) {
      setError("Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onCancel();
      resetState();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()} modal={true}>
      <DialogContent className="sm:max-w-md" showCloseButton={!loading} onPointerDownOutside={(e) => loading && e.preventDefault()} onEscapeKeyDown={(e) => loading && e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>
            {checkingStatus ? "Loading..." : isSetupMode ? "Setup Multi-Factor Authentication" : "Verify Your Identity"}
          </DialogTitle>
        </DialogHeader>

        {checkingStatus ? (
          <div className="py-6 text-center text-muted-foreground">Checking MFA status...</div>
        ) : (
          <div className="space-y-4">
            {isSetupMode ? (
              !isInitialized ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    To enhance your account security, you need to set up multi-factor authentication using an authenticator app.
                  </p>
                  <Button onClick={handleInitializeMfa} disabled={loading} className="w-full">
                    {loading ? "Initializing..." : "Initialize MFA"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col items-center space-y-3">
                    <p className="text-sm text-muted-foreground text-center">
                      Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.):
                    </p>
                    {qrCodeUrl && (
                      <div className="p-4 bg-white rounded-lg">
                        <QRCodeCanvas value={qrCodeUrl} size={200} />
                      </div>
                    )}
                    <div className="w-full p-3 bg-muted rounded-md">
                      <p className="text-xs font-mono break-all">{qrCodeUrl}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="mfa-code" className="text-sm font-medium">
                      Enter the 6-digit code from your app:
                    </label>
                    <Input
                      id="mfa-code"
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value.replace(/\D/g, ""));
                        setError("");
                      }}
                      disabled={loading}
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button onClick={handleConfirmSetup} disabled={loading || code.length !== 6} className="w-full">
                    {loading ? "Verifying..." : "Confirm Setup"}
                  </Button>
                </div>
              )
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This action requires additional verification. Please enter the 6-digit code from your authenticator app.
                </p>
                <div className="space-y-2">
                  <label htmlFor="mfa-code" className="text-sm font-medium">
                    Verification Code:
                  </label>
                  <Input
                    id="mfa-code"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\D/g, ""));
                      setError("");
                    }}
                    disabled={loading}
                    autoFocus
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleClose} disabled={loading} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleVerifyStepUp} disabled={loading || code.length !== 6} className="flex-1">
                    {loading ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
