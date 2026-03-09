import { broadcast } from './events';
import type { AgentStatus } from './types';

interface AgentPresence {
  agentId: string;
  status: AgentStatus;
  lastSeen: number;
}

class PresenceManager {
  private presences: Map<string, AgentPresence> = new Map();
  private readonly IDLE_TIMEOUT = 60 * 1000; // 1 minute
  private readonly OFFLINE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Periodically check for timeouts
    setInterval(() => this.checkTimeouts(), 30 * 1000);
  }

  public heartbeat(agentId: string, status: AgentStatus = 'working'): void {
    const now = Date.now();
    const current = this.presences.get(agentId);
    
    // Only broadcast if status actually changed or it's a new presence
    const statusChanged = !current || current.status !== status;
    
    this.presences.set(agentId, {
      agentId,
      status,
      lastSeen: now,
    });

    if (statusChanged) {
      this.broadcastPresence(agentId, status, new Date(now).toISOString());
    }
  }

  public getStatus(agentId: string): AgentStatus {
    const presence = this.presences.get(agentId);
    if (!presence) return 'offline';

    const now = Date.now();
    const timeSinceLastSeen = now - presence.lastSeen;

    if (timeSinceLastSeen > this.OFFLINE_TIMEOUT) {
      return 'offline';
    }
    
    if (timeSinceLastSeen > this.IDLE_TIMEOUT && presence.status === 'working') {
      return 'standby';
    }

    return presence.status;
  }

  private checkTimeouts(): void {
    const now = Date.now();
    for (const [agentId, presence] of this.presences.entries()) {
      const timeSinceLastSeen = now - presence.lastSeen;
      
      let newStatus = presence.status;
      if (timeSinceLastSeen > this.OFFLINE_TIMEOUT && presence.status !== 'offline') {
        newStatus = 'offline';
      } else if (timeSinceLastSeen > this.IDLE_TIMEOUT && presence.status === 'working') {
        newStatus = 'standby';
      }

      if (newStatus !== presence.status) {
        presence.status = newStatus;
        if (newStatus === 'offline') {
            // we could remove it, but keeping it as offline is fine too
            this.presences.set(agentId, presence);
        } else {
            this.presences.set(agentId, presence);
        }
        this.broadcastPresence(agentId, newStatus, new Date(presence.lastSeen).toISOString());
      }
    }
  }

  private broadcastPresence(agentId: string, status: AgentStatus, lastSeen: string): void {
    broadcast({
      type: 'agent_presence',
      payload: {
        agentId,
        status,
        lastSeen,
      }
    });
  }
}

export const presenceManager = new PresenceManager();
