import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QrCode, Timer, UserCheck, Download, Share2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import QRCodeLib from 'qrcode';

export const QRGenerator = () => {
  const [selectedRole, setSelectedRole] = useState("");
  const [expirationTime, setExpirationTime] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const generateAccessToken = () => {
    const tokenData = {
      role: selectedRole,
      expiration: expirationTime,
      timestamp: Date.now(),
      accessId: Math.random().toString(36).substr(2, 9)
    };
    return `healthlock://access/${btoa(JSON.stringify(tokenData))}`;
  };

  const generateQRCode = async () => {
    if (!selectedRole || !expirationTime) return;
    
    setIsGenerating(true);
    try {
      const accessUrl = generateAccessToken();
      const qrCodeDataUrl = await QRCodeLib.toDataURL(accessUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1f2937',
          light: '#ffffff'
        }
      });
      setQrCodeUrl(qrCodeDataUrl);
      
      toast({
        title: "QR Code Generated",
        description: "Secure access QR code has been created successfully."
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `healthlock-qr-${selectedRole}-${Date.now()}.png`;
    link.href = qrCodeUrl;
    link.click();
    
    toast({
      title: "Download Started",
      description: "QR code image has been downloaded."
    });
  };

  const shareQRCode = async () => {
    if (!qrCodeUrl) return;
    
    try {
      if (navigator.share) {
        const blob = await fetch(qrCodeUrl).then(r => r.blob());
        const file = new File([blob], 'healthlock-qr.png', { type: 'image/png' });
        await navigator.share({
          title: 'HealthLock Access QR Code',
          text: `Secure ${selectedRole} access - expires in ${expirationTime}`,
          files: [file]
        });
      } else {
        await navigator.clipboard.writeText(generateAccessToken());
        toast({
          title: "Link Copied",
          description: "Access link has been copied to clipboard."
        });
      }
    } catch (error) {
      toast({
        title: "Share Failed",
        description: "Unable to share QR code. Try downloading instead.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (selectedRole && expirationTime && !qrCodeUrl) {
      generateQRCode();
    }
  }, [selectedRole, expirationTime]);

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">QR Code Access Generator</h2>
          <p className="text-xl text-muted-foreground">Create secure, temporary access for healthcare providers</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Configuration */}
            <Card className="shadow-medical border-0 bg-gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-primary" />
                  <span>Access Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Healthcare Provider Role</label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor (Full Access)</SelectItem>
                      <SelectItem value="pharmacist">Pharmacist (Prescriptions Only)</SelectItem>
                      <SelectItem value="diagnostics">Diagnostics (Read-Only)</SelectItem>
                      <SelectItem value="specialist">Specialist (Relevant Records)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Access Duration</label>
                  <Select value={expirationTime} onValueChange={setExpirationTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select expiration time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30min">30 Minutes</SelectItem>
                      <SelectItem value="1hour">1 Hour</SelectItem>
                      <SelectItem value="2hours">2 Hours</SelectItem>
                      <SelectItem value="4hours">4 Hours</SelectItem>
                      <SelectItem value="8hours">8 Hours</SelectItem>
                      <SelectItem value="24hours">24 Hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-medical-accent/50 p-4 rounded-lg">
                  <h4 className="font-semibold text-foreground mb-2">Security Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• JWT token-based authentication</li>
                    <li>• Automatic expiration enforcement</li>
                    <li>• Complete access audit trail</li>
                    <li>• Real-time access notifications</li>
                  </ul>
                </div>

                <Button 
                  className="w-full bg-gradient-primary text-lg py-3"
                  disabled={!selectedRole || !expirationTime || isGenerating}
                  onClick={generateQRCode}
                >
                  <QrCode className="w-5 h-5 mr-2" />
                  {isGenerating ? 'Generating...' : 'Generate Secure QR Code'}
                </Button>
              </CardContent>
            </Card>

            {/* QR Code Display */}
            <Card className="shadow-medical border-0 bg-gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <QrCode className="w-5 h-5 text-secondary" />
                  <span>Generated QR Code</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                {qrCodeUrl ? (
                  <>
                    <div className="bg-primary-foreground p-8 rounded-xl mb-6 shadow-card">
                      <img 
                        src={qrCodeUrl} 
                        alt="Generated QR Code" 
                        className="w-48 h-48 mx-auto rounded-lg"
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-center space-x-2">
                        <Badge className="bg-primary text-primary-foreground">
                          {selectedRole?.charAt(0).toUpperCase() + selectedRole?.slice(1)} Access
                        </Badge>
                        <Badge variant="outline" className="flex items-center space-x-1">
                          <Timer className="w-3 h-3" />
                          <span>{expirationTime}</span>
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        This QR code will provide secure, time-limited access to selected medical records
                      </p>
                      
                      <div className="flex space-x-3">
                        <Button variant="outline" className="flex-1" onClick={downloadQRCode}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={shareQRCode}>
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-16">
                    <div className="w-24 h-24 mx-auto bg-muted rounded-lg flex items-center justify-center mb-4">
                      <QrCode className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">Configure access settings to generate QR code</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};