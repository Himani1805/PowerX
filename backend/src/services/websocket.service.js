import prisma from '../config/prisma.js';

class WebSocketService {
  constructor(wss) {
    this.wss = wss;
    this.clients = new Set();
    this.setupWebSocket();
  }

  setupWebSocket() {
    this.wss.on('connection', (ws) => {
      console.log('New WebSocket connection');
      this.clients.add(ws);

      ws.on('close', () => {
        console.log('Client disconnected');
        this.clients.delete(ws);
      });

      // Send initial data
      this.broadcastAnalytics();
    });
  }

  async broadcastAnalytics() {
    try {
      const [leadsOverTime, leadSources, conversionRates] = await Promise.all([
        this.getLeadsOverTime(),
        this.getLeadSources(),
        this.getConversionRates()
      ]);

      const data = {
        type: 'analytics_update',
        data: {
          leadsOverTime,
          leadSources,
          conversionRates,
          timestamp: new Date().toISOString()
        }
      };

      this.broadcast(JSON.stringify(data));
    } catch (error) {
      console.error('Error broadcasting analytics:', error);
    }
  }

  async getLeadsOverTime() {
    const leads = await prisma.lead.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    return leads.map(item => ({
      date: item.createdAt.toISOString().split('T')[0],
      count: item._count.id,
    }));
  }

  async getLeadSources() {
    const sources = await prisma.lead.groupBy({
      by: ['source'],
      _count: { id: true },
    });

    return sources.map(item => ({
      name: item.source,
      value: item._count.id,
    }));
  }

  async getConversionRates() {
    const statuses = await prisma.lead.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    return statuses.map(item => ({
      name: item.status,
      value: item._count.id,
    }));
  }

  broadcast(data) {
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  // Call this method when you want to notify all clients of data changes
  notifyDataChanged() {
    this.broadcastAnalytics();
  }
}

export default WebSocketService;
