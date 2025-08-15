import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';
import { messagingService } from '../../services/api/messagingService';

interface Message {
  id: string;
  from: string;
  to: string;
  text: string;
  read: boolean;
  timestamp: number;
}

interface MessagingProps {
  usersList: User[];
}

const Messaging: React.FC<MessagingProps> = ({ usersList }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [input, setInput] = useState('');
  const [unread, setUnread] = useState<{ [key: string]: number }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages from API
  useEffect(() => {
    if (!user || !selectedUserId) return;
    messagingService.getMessages(String(user.id), selectedUserId).then(setMessages);
  }, [user, selectedUserId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Compute unread badge
  useEffect(() => {
    const unreadCount: { [key: string]: number } = {};
    messages.forEach(msg => {
      if (!msg.read && msg.to === String(user?.id)) {
        unreadCount[msg.from] = (unreadCount[msg.from] || 0) + 1;
      }
    });
    setUnread(unreadCount);
  }, [messages, user]);

  // Get possible recipients

  let recipients: User[] = [];
  let adminUser: User | undefined = undefined;
  if (user?.role === 'admin') {
    recipients = usersList.filter(u => u.role !== 'admin');
  } else {
    recipients = usersList.filter(u => u.role === 'admin');
    adminUser = recipients[0];
    // Sélectionne automatiquement l'admin si pas déjà sélectionné
    React.useEffect(() => {
      if (adminUser && selectedUserId !== String(adminUser.id)) {
        setSelectedUserId(String(adminUser.id));
      }
    }, [adminUser]);
  }

  // Handle send
  const handleSend = async () => {
    if (!input.trim() || (!selectedUserId && !adminUser && user?.role === 'admin')) return;
    // Fallback pour l'id admin si non trouvé
    let fallbackAdminId = '';
    if (user?.role !== 'admin' && (!adminUser || !adminUser.id)) {
      const foundAdmin = usersList.find(u => u.role === 'admin');
      fallbackAdminId = foundAdmin ? String(foundAdmin.id) : '1';
    }
    const toId = user?.role === 'admin' ? selectedUserId : (adminUser?.id || fallbackAdminId);
    await messagingService.sendMessage(String(user!.id), String(toId), input);
    const updated = await messagingService.getMessages(String(user!.id), String(toId));
    setMessages(updated);
    setInput('');
  };

  // Mark as read when opening chat
  useEffect(() => {
    const toId = user?.role === 'admin' ? selectedUserId : adminUser?.id;
    if (!toId || !user) return;
    messagingService.markAsRead(String(user.id), String(toId)).then(() => {
      messagingService.getMessages(String(user.id), String(toId)).then(setMessages);
    });
  }, [selectedUserId, user, adminUser]);

  // Filter messages for current chat
  // Fallback pour l'id admin si non trouvé dans usersList
  let fallbackAdminId = '';
  if (!adminUser || !adminUser.id) {
    // Cherche dans usersList ou force à '1' si tu sais que l'admin a l'id 1
    const foundAdmin = usersList.find(u => u.role === 'admin');
    fallbackAdminId = foundAdmin ? String(foundAdmin.id) : '1';
  }
  const toId = user?.role === 'admin' ? selectedUserId : (adminUser?.id || fallbackAdminId);
  const chatMessages = messages.filter(
    msg => (msg.from === String(user?.id) && msg.to === String(toId)) || (msg.from === String(toId) && msg.to === String(user?.id))
  );

  return (
    <div className="w-[90vw] max-w-7xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 flex h-[700px]">
      {/* Liste des destinataires (admin: tous les clients, client: admin uniquement) */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 pr-4 flex flex-col overflow-y-auto">
        {user?.role === 'admin' ? (
          <>
            <div className="px-4 pt-2 pb-2">
              <div className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-2">Conversations</div>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none mb-2"
                placeholder="Rechercher par pseudo..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            {recipients
              .filter(u => u.pseudo && u.pseudo.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(u => (
                <div key={u.id} className={`flex items-center gap-3 p-3 cursor-pointer rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 ${selectedUserId === String(u.id) ? 'bg-blue-100 dark:bg-gray-700' : ''}`}
                  onClick={() => setSelectedUserId(String(u.id))}>
                  <img src={u.avatar || '/public/avatars/avatar1.svg'} alt="avatar" className="w-12 h-12 rounded-full border" />
                  <div className="flex-1">
                    <span className="font-medium text-lg text-gray-800 dark:text-gray-100">{unread[u.id] > 0 && <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>}{u.pseudo}</span>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{u.email}</div>
                  </div>
                </div>
              ))}
          </>
        ) : (
          adminUser && adminUser.id && user?.role !== 'admin' && adminUser.role === 'admin' ? (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-100 dark:bg-gray-700">
              <img src={adminUser.avatar || '/public/avatars/avatar1.svg'} alt="avatar" className="w-14 h-14 rounded-full border" />
              <div className="flex-1">
                <span className="font-semibold text-xl text-gray-800 dark:text-gray-100">{adminUser.firstName}</span>
                <div className="text-xs text-gray-500 dark:text-gray-400">{adminUser.email}</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-100 dark:bg-gray-700">
              <img src="/public/avatars/avatar1.svg" alt="avatar" className="w-14 h-14 rounded-full border" />
              <div className="flex-1">
                <span className="font-semibold text-xl text-gray-800 dark:text-gray-100">Administrateur</span>
                <div className="text-xs text-gray-500 dark:text-gray-400">admin@example.com</div>
              </div>
            </div>
          )
        )}
      </div>
      {/* Zone de messages */}
      <div className="flex-1 flex flex-col pl-4">
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-md p-2 mb-2 border border-gray-200 dark:border-gray-700">
          {chatMessages.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">Aucun message</div>
          ) : (
            chatMessages.map(msg => (
              <div key={msg.id} className={`mb-2 flex ${msg.from === String(user?.id) ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-3 py-2 rounded-lg shadow text-sm ${msg.from === String(user?.id) ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}>
                  {msg.text}
                  <div className="text-[10px] text-right mt-1 opacity-60">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none"
            placeholder="Écrire un message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={user?.role === 'admin' ? !selectedUserId : !adminUser}
          />
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            onClick={handleSend}
            disabled={!input.trim() || (user?.role === 'admin' ? !selectedUserId : !adminUser)}
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
};

export default Messaging;
