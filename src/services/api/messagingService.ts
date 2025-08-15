// messagingService.ts
// Service pour la messagerie instantanée (frontend)

export const messagingService = {
  async getMessages(userId: string, otherId: string) {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/messaging/messages?userId=${userId}&otherId=${otherId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return await res.json();
  },

  async sendMessage(from: string, to: string, text: string) {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/messaging/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ from, to, text })
    });
    return await res.json();
  },

  async markAsRead(userId: string, otherId: string) {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/messaging/messages/read', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ userId, otherId })
    });
    return await res.json();
  }
};
