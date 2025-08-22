import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, QrCode, Clock, Users } from "lucide-react";

export const Hero = () => {
  return (
    <section className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-6">
        <div className="text-center text-primary-foreground mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Secure Patient Record
            <br />
            <span className="text-secondary-glow">Sharing Platform</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90 max-w-3xl mx-auto">
            Share medical records instantly with QR codes. 
            Complete privacy, temporary access, role-based permissions.
          </p>
          <Button size="lg" className="bg-secondary hover:bg-secondary-glow text-secondary-foreground font-semibold px-8 py-4 text-lg shadow-medical">
            Start Secure Sharing
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mt-16">
          {[
            { icon: Shield, title: "End-to-End Encryption", desc: "Military-grade security" },
            { icon: QrCode, title: "QR Code Access", desc: "Instant, temporary sharing" },
            { icon: Clock, title: "Time-Limited Access", desc: "Automatic expiration" },
            { icon: Users, title: "Role-Based Control", desc: "Doctor, pharmacist, diagnostics" }
          ].map((feature, i) => (
            <Card key={i} className="bg-card/95 backdrop-blur-sm p-6 text-center border-0 shadow-card hover:shadow-glow transition-all duration-300">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};