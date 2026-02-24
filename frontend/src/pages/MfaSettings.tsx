import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import mfaApi from "@/api/mfaApi";
import { toast } from "react-toastify";

export default function MfaSettings() {
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(false);
  const [setupMode, setSetupMode] = useState<boolean>(false);
  const [disableMode, setDisableMode] = useState<boolean>(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [disableCode, setDisableCode] = useState<string>("");

  const checkStatus = async () => {
    try {
      setChecking(true);
      const response = await mfaApi.status();
      setMfaEnabled(response.success);
      toast.success(response.message);
    } catch (error: any) {
      toast.error("Failed to check MFA status");
    } finally {
      setChecking(false);
    }
  };

  const handleInitMfa = async () => {
    try {
      setLoading(true);
      console.log("[MFA] Calling POST /api/mfa/setup/init ...");
      const response = await mfaApi.init();
      console.log("[MFA] /setup/init response:", response);
      setQrCodeUrl(response.qrCodeUrl);
      setSecret(response.secret);
      setSetupMode(true);
      toast.success("MFA initialized! Scan the QR code with your authenticator app.");
    } catch (error: any) {
      console.error("[MFA] /setup/init error:", error);
      console.error("[MFA] status:", error?.response?.status);
      console.error("[MFA] data:", error?.response?.data);
      toast.error(error.response?.data?.message || "Failed to initialize MFA");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSetup = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    try {
      setLoading(true);
      const response = await mfaApi.confirmSetup(verificationCode);
      toast.success("MFA enabled successfully!");
      setMfaEnabled(true);
      setSetupMode(false);
      setQrCodeUrl("");
      setSecret("");
      setVerificationCode("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDisable = async () => {
    if (!disableCode || disableCode.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    try {
      setLoading(true);
      await mfaApi.disable(disableCode);
      toast.success("MFA disabled successfully!");
      setMfaEnabled(false);
      setDisableMode(false);
      setDisableCode("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to disable MFA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Multi-Factor Authentication Settings</h1>

        <div className="space-y-6">
          {/* Status Section */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">MFA Status</h3>
                <p className="text-sm text-muted-foreground">
                  Current status: <span className={mfaEnabled ? "text-green-600 font-medium" : "text-gray-600"}>{mfaEnabled ? "Enabled" : "Not Enabled"}</span>
                </p>
              </div>
              <Button onClick={checkStatus} disabled={checking} variant="outline">
                {checking ? "Checking..." : "Check Status"}
              </Button>
            </div>
          </div>

          {/* Setup Section */}
          {!mfaEnabled && !setupMode && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">Setup MFA</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Enhance your account security by enabling two-factor authentication using an authenticator app.
              </p>
              <Button onClick={handleInitMfa} disabled={loading}>
                {loading ? "Initializing..." : "Initialize MFA Setup"}
              </Button>
            </div>
          )}

          {/* QR Code Section */}
          {setupMode && qrCodeUrl && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-4">Scan QR Code</h3>
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-white border rounded-lg">
                  <QRCodeCanvas value={qrCodeUrl} size={250} />
                </div>
                <div className="w-full">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Secret Key (for manual entry):</p>
                  <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
                    {secret}
                  </div>
                </div>
                <div className="w-full">
                  <p className="text-xs font-medium text-muted-foreground mb-1">OTP Auth URL:</p>
                  <div className="p-3 bg-muted rounded-md font-mono text-xs break-all">
                    {qrCodeUrl}
                  </div>
                </div>

                <div className="w-full space-y-2">
                  <label htmlFor="verification-code" className="text-sm font-medium">
                    Enter the 6-digit code from your authenticator app:
                  </label>
                  <Input
                    id="verification-code"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                    disabled={loading}
                  />
                </div>

                <div className="flex gap-2 w-full">
                  <Button variant="outline" onClick={() => setSetupMode(false)} disabled={loading} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmSetup} disabled={loading || verificationCode.length !== 6} className="flex-1">
                    {loading ? "Verifying..." : "Confirm & Enable MFA"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Disable Section */}
          {mfaEnabled && !setupMode && (
            <div className="border border-destructive/50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2 text-destructive">Disable MFA</h3>
              
              {!disableMode ? (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    Warning: Disabling MFA will reduce your account security.
                  </p>
                  <Button onClick={() => setDisableMode(true)} disabled={loading} variant="destructive">
                    Disable MFA
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code from your authenticator app to confirm:
                  </p>
                  <Input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ""))}
                    disabled={loading}
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => { setDisableMode(false); setDisableCode(""); }} disabled={loading} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleConfirmDisable} disabled={loading || disableCode.length !== 6} variant="destructive" className="flex-1">
                      {loading ? "Disabling..." : "Confirm Disable"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm mb-2">How it works:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
              <li>Click "Initialize MFA Setup" to generate a QR code</li>
              <li>Scan the QR code with Google Authenticator or similar app</li>
              <li>Enter the 6-digit code from your app to confirm</li>
              <li>MFA will be required for sensitive operations (DELETE, UPDATE)</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
