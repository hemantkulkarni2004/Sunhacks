import { Button } from "@/components/ui/button";
import { Shield, Lock, UserCheck } from "lucide-react";

export const Header = () => {
  return (
    <header className="bg-gradient-card border-b border-border/50 shadow-card">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-primary rounded-lg shadow-glow">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">HealthLock</h1>
              <p className="text-xs text-muted-foreground">Secure Patient Records</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-medical-accent px-4 py-2 rounded-full">
              <Lock className="w-4 h-4 text-trust" />
              <span className="text-sm font-medium text-foreground">End-to-End Encrypted</span>
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4" />
              <span>Patient Portal</span>
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
};