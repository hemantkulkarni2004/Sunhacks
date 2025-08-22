import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { PatientDashboard } from "@/components/PatientDashboard";
import { QRGenerator } from "@/components/QRGenerator";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <PatientDashboard />
      <QRGenerator />
    </div>
  );
};

export default Index;
