"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Globe,
  Brain,
  Shield,
  Activity,
  ArrowRight,
  CheckCircle,
  Users,
  Zap,
  MapPin,
  TrendingUp,
  Eye,
  Network,
  Bot,
  Truck,
} from "lucide-react";

interface LandingPageProps {
  onEnterDashboard: () => void;
}

export function LandingPage({ onEnterDashboard }: LandingPageProps) {
  const [currentStats, setCurrentStats] = useState({
    activeCountries: 12,
    missionsCompleted: 2847,
    fundsDeployed: 4.2,
    responseTime: 18,
  });

  useEffect(() => {
    // Animate stats on load
    const interval = setInterval(() => {
      setCurrentStats((prev) => ({
        activeCountries: Math.min(prev.activeCountries + 1, 15),
        missionsCompleted: Math.min(prev.missionsCompleted + 23, 3200),
        fundsDeployed: Math.min(prev.fundsDeployed + 0.1, 5.8),
        responseTime: Math.max(prev.responseTime - 1, 12),
      }));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Coordination",
      description:
        "Advanced neural networks analyze global needs and optimize resource allocation in real-time, reducing response times by 70%.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Network,
      title: "Autonomous Network",
      description:
        "Self-coordinating supply chains with MeTTa reasoning engines that adapt to changing conditions without human intervention.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Shield,
      title: "Transparent Operations",
      description:
        "Blockchain-verified deliveries with cryptographic proof ensure every dollar reaches its destination with full accountability.",
      color: "from-green-500 to-green-600",
    },
  ];

  const processSteps = [
    {
      step: "01",
      title: "Need Detection",
      description:
        "AI agents continuously monitor global humanitarian needs and crisis situations.",
      icon: Activity,
    },
    {
      step: "02",
      title: "Resource Optimization",
      description:
        "Advanced algorithms match available supplies with urgent needs, optimizing for speed and cost.",
      icon: Bot,
    },
    {
      step: "03",
      title: "Mission Execution",
      description:
        "Autonomous coordination of suppliers, logistics, and field teams for rapid deployment.",
      icon: Truck,
    },
    {
      step: "04",
      title: "Verification & Audit",
      description:
        "Cryptographic proof of delivery with recipient verification ensures complete transparency.",
      icon: CheckCircle,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-secondary/8"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'%3e%3cpath d='m 40 0 l 0 40 m -40 0 l 40 0' stroke='%23e5e7eb' stroke-width='0.5'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23grid)'/%3e%3c/svg%3e")`,
            opacity: 0.03,
          }}
        ></div>

        <div className="relative max-w-8xl mx-auto px-8 py-24 lg:py-32">
          <div className="text-center space-y-12">
            {/* Logo and Branding */}
            <div className="flex flex-col items-center space-y-6">
              <div className="flex items-center gap-6">
                {/* <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl p-4"> */}
                <Image
                  src="/logo.png"
                  alt="AidRoute Logo"
                  width={48}
                  height={48}
                  className="w-20 h-20 object-contain"
                  priority
                />
                {/* </div> */}
                <div className="text-left">
                  <h1 className="text-5xl lg:text-6xl font-display font-bold tracking-tight">
                    AidRoute
                  </h1>
                  <p className="text-lg text-muted-foreground font-medium tracking-wide">
                    Autonomous Humanitarian Coordination
                  </p>
                </div>
              </div>
            </div>

            {/* Main Headline */}
            <div className="space-y-8">
              <h2 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-display font-bold leading-[0.9] tracking-tight">
                <span className="block">Coordinating Aid.</span>
                <span className="block bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Autonomously.
                </span>
              </h2>
              <p className="text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light">
                The world's first AI-powered humanitarian logistics platform.{" "}
                <span className="font-medium text-foreground">
                  Our autonomous agents coordinate global aid delivery
                </span>{" "}
                with unprecedented speed, efficiency, and transparency.
              </p>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-5xl mx-auto mt-16">
              <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-4xl lg:text-5xl font-display font-bold text-primary mb-2">
                  {currentStats.activeCountries}
                </div>
                <div className="text-sm lg:text-base text-muted-foreground font-medium tracking-wide">
                  Active Countries
                </div>
              </div>
              <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-4xl lg:text-5xl font-display font-bold text-green-600 mb-2">
                  {currentStats.missionsCompleted.toLocaleString()}
                </div>
                <div className="text-sm lg:text-base text-muted-foreground font-medium tracking-wide">
                  Missions Completed
                </div>
              </div>
              <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-4xl lg:text-5xl font-display font-bold text-blue-600 mb-2">
                  ${currentStats.fundsDeployed.toFixed(1)}M
                </div>
                <div className="text-sm lg:text-base text-muted-foreground font-medium tracking-wide">
                  Funds Deployed
                </div>
              </div>
              <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                <div className="text-4xl lg:text-5xl font-display font-bold text-purple-600 mb-2">
                  {currentStats.responseTime}min
                </div>
                <div className="text-sm lg:text-base text-muted-foreground font-medium tracking-wide">
                  Avg Response
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-12">
              <button
                onClick={onEnterDashboard}
                className="group bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-12 py-5 rounded-2xl font-display font-semibold text-xl hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105"
              >
                <div className="flex items-center gap-4">
                  <Zap className="w-6 h-6" />
                  <span>Enter Command Center</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 lg:py-32 bg-secondary/10">
        <div className="max-w-8xl mx-auto px-8">
          <div className="text-center mb-20">
            <h3 className="text-4xl lg:text-5xl font-display font-bold mb-6 tracking-tight">
              Powered by Advanced AI
            </h3>
            <p className="text-muted-foreground text-xl lg:text-2xl max-w-3xl mx-auto font-light leading-relaxed">
              Our autonomous systems combine cutting-edge AI with humanitarian
              expertise to revolutionize global aid coordination.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-3xl p-10 text-center group hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl"
                >
                  <div
                    className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-2xl font-display font-semibold mb-5 tracking-tight">
                    {feature.title}
                  </h4>
                  <p className="text-muted-foreground leading-relaxed text-lg font-light">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 lg:py-32">
        <div className="max-w-8xl mx-auto px-8">
          <div className="text-center mb-20">
            <h3 className="text-4xl lg:text-5xl font-display font-bold mb-6 tracking-tight">
              How AidRoute Works
            </h3>
            <p className="text-muted-foreground text-xl lg:text-2xl max-w-3xl mx-auto font-light leading-relaxed">
              From crisis detection to verified delivery, our AI agents handle
              every step of the humanitarian logistics pipeline.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  {index < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-16 -right-3 w-6 h-px bg-gradient-to-r from-primary/60 to-transparent"></div>
                  )}
                  <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-3xl p-8 text-center hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Icon className="w-8 h-8" />
                    </div>
                    <div className="text-lg font-mono font-semibold text-primary mb-3 tracking-wider">
                      {step.step}
                    </div>
                    <h4 className="font-display font-semibold mb-4 text-xl tracking-tight">
                      {step.title}
                    </h4>
                    <p className="text-muted-foreground leading-relaxed font-light">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Capabilities Preview */}
      <section className="py-20 bg-secondary/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">
              Command Center Capabilities
            </h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Access a comprehensive suite of tools designed for humanitarian
              professionals and AI-assisted decision making.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-6 h-6 text-blue-500" />
                <h4 className="font-semibold">Operations Center</h4>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Real-time mission tracking, resource coordination, and live
                logistics visualization.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Live mission tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Interactive global map</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Real-time analytics</span>
                </li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-purple-500" />
                <h4 className="font-semibold">AI Planning Assistant</h4>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Collaborate with advanced AI agents for optimal mission planning
                and resource allocation.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Intelligent route optimization</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>MeTTa reasoning engine</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Predictive analytics</span>
                </li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-green-500" />
                <h4 className="font-semibold">Transparency Portal</h4>
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Complete audit trail with cryptographic verification for maximum
                accountability.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Blockchain verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Delivery proof system</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Fund tracking</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 lg:py-32 bg-gradient-to-br from-primary/15 via-blue-500/10 to-purple-500/15">
        <div className="max-w-5xl mx-auto px-8 text-center">
          <h3 className="text-4xl lg:text-5xl font-display font-bold mb-8 tracking-tight">
            Ready to Transform Humanitarian Logistics?
          </h3>
          <p className="text-muted-foreground text-xl lg:text-2xl mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            Join the future of autonomous aid coordination. Experience the power
            of AI-driven humanitarian logistics in our advanced command center.
          </p>

          <div className="flex items-center justify-center gap-4 mb-12">
            <button
              onClick={onEnterDashboard}
              className="group bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-12 py-6 rounded-2xl font-display font-semibold text-xl hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105"
            >
              <div className="flex items-center gap-4">
                <Zap className="w-6 h-6" />
                <span>Launch AidRoute Dashboard</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12 text-base text-muted-foreground">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5" />
              <span className="font-medium">Field Coordinator Access</span>
            </div>
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5" />
              <span className="font-medium">Real-time Monitoring</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Secure & Verified</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
