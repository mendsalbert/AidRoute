'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { aidRouteSimulation, type SystemStats } from '@/lib/simulation'
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  ArrowRight,
  Globe,
  Zap,
  Users,
  Map
} from 'lucide-react'

interface HomeViewProps {
  onNavigate: (view: 'operations' | 'planning' | 'audit') => void
}

export function HomeView({ onNavigate }: HomeViewProps) {
  const [stats, setStats] = useState<SystemStats>({
    activeMissions: 0,
    urgentNeeds: 0,
    verifiedDeliveries: 0,
    totalFundsDeployed: 0
  })
  const [recentActivity, setRecentActivity] = useState<string[]>([])

  useEffect(() => {
    // Initial load
    setStats(aidRouteSimulation.getSystemStats())
    
    // Set up listeners for real-time updates
    const updateStats = () => setStats(aidRouteSimulation.getSystemStats())
    
    const handleNeedAdded = (need: any) => {
      setRecentActivity(prev => [
        `New Need Registered: ${need.location} – ${need.item}`,
        ...prev.slice(0, 4)
      ])
    }

    const handleMissionCompleted = ({ mission }: any) => {
      setRecentActivity(prev => [
        `Mission #${mission.id.slice(-3)} Confirmed – Delivered to ${mission.destination}`,
        ...prev.slice(0, 4)
      ])
    }

    const handleMissionStatus = (mission: any) => {
      if (mission.status === 'en-route') {
        setRecentActivity(prev => [
          `Mission #${mission.id.slice(-3)} En Route – ${mission.destination}`,
          ...prev.slice(0, 4)
        ])
      }
    }

    // Subscribe to events
    aidRouteSimulation.on('missions-updated', updateStats)
    aidRouteSimulation.on('needs-updated', updateStats)
    aidRouteSimulation.on('audit-updated', updateStats)
    aidRouteSimulation.on('need-added', handleNeedAdded)
    aidRouteSimulation.on('mission-completed', handleMissionCompleted)
    aidRouteSimulation.on('mission-status-changed', handleMissionStatus)

    // Update stats every 5 seconds
    const interval = setInterval(updateStats, 5000)

    return () => {
      clearInterval(interval)
      aidRouteSimulation.off('missions-updated', updateStats)
      aidRouteSimulation.off('needs-updated', updateStats)
      aidRouteSimulation.off('audit-updated', updateStats)
      aidRouteSimulation.off('need-added', handleNeedAdded)
      aidRouteSimulation.off('mission-completed', handleMissionCompleted)
      aidRouteSimulation.off('mission-status-changed', handleMissionStatus)
    }
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="p-6 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
            <Globe className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Coordinating Aid. Autonomously.</h1>
            <p className="text-lg text-muted-foreground mt-2">
              AI agents optimize humanitarian logistics in real-time, ensuring rapid response and transparent delivery
            </p>
          </div>
        </div>
      </div>

      {/* Live Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <Activity className="w-8 h-8 text-blue-500" />
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.activeMissions}</p>
            <p className="text-sm text-muted-foreground">Active Missions</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.urgentNeeds}</p>
            <p className="text-sm text-muted-foreground">Urgent Needs</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.verifiedDeliveries}</p>
            <p className="text-sm text-muted-foreground">Verified Deliveries</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
          </div>
          <div>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalFundsDeployed)}</p>
            <p className="text-sm text-muted-foreground">Total Funds Deployed</p>
          </div>
        </div>
      </div>

      {/* System Status Feed */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-green-500" />
          <h3 className="text-lg font-semibold">Live System Activity</h3>
          <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Real-time</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div
                key={index}
                className={cn(
                  "p-3 bg-secondary/50 rounded-lg text-sm",
                  "animate-in slide-in-from-top-1 duration-500",
                  index === 0 && "bg-primary/10 border border-primary/20"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>{activity}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {index === 0 ? 'Just now' : `${(index + 1) * 2}m ago`}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Monitoring system activity...</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation CTAs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => onNavigate('operations')}
          className="group bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6 text-left hover:from-blue-500/20 hover:to-blue-600/20 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <Map className="w-10 h-10 text-blue-500" />
            <ArrowRight className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Launch Operations Center</h3>
          <p className="text-sm text-muted-foreground">
            Monitor live logistics coordination, active missions, and real-time aid movements across the network
          </p>
        </button>

        <button
          onClick={() => onNavigate('planning')}
          className="group bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6 text-left hover:from-purple-500/20 hover:to-purple-600/20 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="w-10 h-10 text-purple-500" />
            <ArrowRight className="w-5 h-5 text-purple-500 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Collaborate with AI Planner</h3>
          <p className="text-sm text-muted-foreground">
            Work with autonomous AI agents to optimize delivery routes, allocate resources, and plan missions
          </p>
        </button>

        <button
          onClick={() => onNavigate('audit')}
          className="group bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6 text-left hover:from-green-500/20 hover:to-green-600/20 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
            <ArrowRight className="w-5 h-5 text-green-500 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Open Audit Portal</h3>
          <p className="text-sm text-muted-foreground">
            Access transparent mission records, verify delivery proofs, and track fund deployment with full accountability
          </p>
        </button>
      </div>
    </div>
  )
}
