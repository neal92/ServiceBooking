import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';
import { messagingService } from '../../services/api/messagingService';
import { getSocket } from '../../utils/socket';

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

  // adminUser et recipients sont déclarés AVANT tous les hooks pour éviter ReferenceError
  const recipients: User[] = user?.role === 'admin'
    ? usersList.filter(u => u.role !== 'admin')
    : usersList.filter(u => u.role === 'admin');

  const adminUser: User | undefined = user?.role !== 'admin'
    ? usersList.find(u => u.role === 'admin')
    : undefined;

  // Fetch messages from API
  useEffect(() => {
    if (!user || !selectedUserId) return;
    messagingService.getMessages(String(user.id), selectedUserId).then(setMessages);
  }, [user, selectedUserId]);

  // Socket.io: écoute les nouveaux messages (adminUser garanti initialisé)
  useEffect(() => {
    if (!user || !selectedUserId) return;
    let toId: string;
    if (user?.role === 'admin') {
      toId = selectedUserId;
    } else {
      toId = adminUser ? String(adminUser.id) : '1';
    }
    const socket = getSocket();
    socket.on('messageReceived', (message) => {
      if ((message.from === String(user.id) && message.to === String(toId)) || (message.from === String(toId) && message.to === String(user.id))) {
        setMessages((prev) => [...prev, message]);
      }
    });
    return () => {
      socket.off('messageReceived');
    };
  }, [user, selectedUserId, adminUser]);

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

  // (Déjà déclaré en haut, ne pas redéclarer)

  // Sélectionne automatiquement l'admin si pas déjà sélectionné
  useEffect(() => {
    if (adminUser && selectedUserId !== String(adminUser.id)) {
      setSelectedUserId(String(adminUser.id));
    }
  }, [adminUser]);

  // Handle send
  const handleSend = async () => {
    if (!input.trim() || (!selectedUserId && !adminUser && user?.role === 'admin')) return;
    let fallbackAdminId = '';
    if (user?.role !== 'admin' && (!adminUser || !adminUser.id)) {
      const foundAdmin = usersList.find(u => u.role === 'admin');
      fallbackAdminId = foundAdmin ? String(foundAdmin.id) : '1';
    }
    const toId = user?.role === 'admin' ? selectedUserId : (adminUser?.id || fallbackAdminId);
    // Envoie le message via l'API (pour persistance)
    await messagingService.sendMessage(String(user!.id), String(toId), input);
    // Envoie le message via socket.io (pour temps réel)
    const socket = getSocket();
    socket.emit('newMessage', {
      from: String(user!.id),
      to: String(toId),
      text: input,
      timestamp: Date.now(),
      read: false,
      id: Math.random().toString(36).substr(2, 9) // id temporaire
    });
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
                    <span className="font-medium text-lg text-gray-800 dark:text-gray-100">
                      {u.pseudo}
                      {unread[u.id] > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                          {unread[u.id]}
                        </span>
                      )}
                    </span>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{u.email}</div>
                    {/* Date du dernier message supprimée */}
                  </div>
                </div>
              ))}
          </>
        ) : (
          <>
            <div className="px-4 pt-2 pb-2">
              <div className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-2">Conversations</div>
            </div>
            {adminUser && (
              <div className="flex flex-col items-center gap-2 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg mb-4 mt-32">
                {adminUser.avatar && adminUser.avatar !== '' ? (
                  <img src={adminUser.avatar} alt="avatar" className="w-16 h-16 rounded-full border-2 border-blue-400" />
                ) : adminUser.avatarInitials ? (
                  <div className="w-16 h-16 rounded-full border-2 border-blue-400 flex items-center justify-center bg-blue-200 text-blue-800 text-2xl font-bold">
                    {adminUser.avatarInitials}
                  </div>
                ) : (
                  <img src="/public/avatars/avatar1.svg" alt="avatar" className="w-16 h-16 rounded-full border-2 border-blue-400" />
                )}
                <span className="font-semibold text-lg text-blue-800 dark:text-blue-200">{adminUser.pseudo}</span>
                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Prestataire</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">Vous ne pouvez discuter qu'avec le prestataire.</span>
              </div>
            )}
          </>
        )}
      </div>
      {/* Zone de messages */}
      <div className="flex-1 flex flex-col pl-4">
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-md p-2 mb-2 border border-gray-200 dark:border-gray-700">
          {chatMessages.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">Aucun message</div>
          ) : (
            (() => {
              let lastDate = '';
              return chatMessages.map((msg, idx) => {
                const msgDate = new Date(msg.timestamp).toLocaleDateString();
                const showDate = msgDate !== lastDate;
                lastDate = msgDate;
                return (
                  <React.Fragment key={msg.id}>
                    {showDate && (
                      <div className="w-full flex justify-center mb-2">
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 rounded px-3 py-1">{msgDate}</span>
                      </div>
                    )}
                    <div className={`mb-2 flex flex-col ${msg.from === String(user?.id) ? 'items-end' : 'items-start'}`}>
                      <span className="text-xs text-gray-500 mb-1">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                      <div className={`max-w-[70%] px-3 py-2 rounded-lg shadow text-sm ${msg.from === String(user?.id) ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'}`}>
                        {msg.text}
                      </div>
                    </div>
                  </React.Fragment>
                );
              });
            })()
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
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
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
