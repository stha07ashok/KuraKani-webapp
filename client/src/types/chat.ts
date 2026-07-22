export interface SearchedUser {
  id: number;
  name: string;
  email: string;
  profilePicture?: string;
  friendshipStatus: 'none' | 'pending_sent' | 'pending_received' | 'friends';
}

export interface Friend {
  id: number;
  name: string;
  email: string;
  profilePicture?: string;
  friendRequestId: number;
}

export interface PendingRequest {
  id: number;
  senderId: number;
  status: string;
  sender: { id: number; name: string; email: string; profilePicture?: string };
  createdAt: string;
}

export interface MessageData {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  isMessageRequest: boolean;
  readAt: string | null;
  createdAt: string;
  deletedAt?: string | null;
  deletedForSenderAt?: string | null;
  deletedForReceiverAt?: string | null;
  editedAt?: string | null;
  sender?: { id: number; name: string; email: string; profilePicture?: string };
  receiver?: { id: number; name: string; email: string; profilePicture?: string };
  replyTo?: {
    id: number;
    content: string;
    sender?: { id: number; name: string; profilePicture?: string };
  };
}

export interface MessageRequestGroup {
  sender: { id: number; name: string; email: string; profilePicture?: string };
  messages: MessageData[];
}

export interface BaseUser {
  id: number;
  name: string;
  email: string;
  profilePicture?: string;
}

export interface ToastNotification {
  id: number;
  senderId: number;
  senderName: string;
  senderPicture?: string;
  content: string;
}

export interface UserAvatarProps {
  name: string;
  profilePicture?: string;
  size?: number;
  className?: string;
}

export interface CallLogEntry {
  id: number;
  callerId: number;
  receiverId: number;
  type: 'audio' | 'video';
  status: 'missed' | 'answered' | 'rejected';
  startedAt?: string | null;
  endedAt?: string | null;
  duration?: number | null;
  createdAt: string;
  caller?: { id: number; name: string; profilePicture?: string };
  receiver?: { id: number; name: string; profilePicture?: string };
}

export interface ChatAreaProps {
  friend: BaseUser;
  messages: MessageData[];
  callLogs: CallLogEntry[];
  loading: boolean;
  currentUserId: number;
  onSend: (content: string, replyToMessageId?: number | null) => void;
  onUnsend: (messageId: number, mode: 'me' | 'everyone') => void;
  onHideUnsent: (messageId: number) => void;
  onEdit: (messageId: number, content: string) => void;
  onBack: () => void;
  onAudioCall?: (peerId: number, peerName: string) => void;
  onVideoCall?: (peerId: number, peerName: string) => void;
}

export interface ChatSidebarProps {
  user: BaseUser;
  searchQuery: string;
  searchResults: SearchedUser[];
  friends: Friend[];
  friendsLoading: boolean;
  selectedFriendId?: number;
  unreadCounts: Record<number, number>;
  pendingRequests: PendingRequest[];
  messageRequests: MessageRequestGroup[];
  onSearch: (q: string) => void;
  onSelectFriend: (friend: Friend) => void;
  onSelectUser: (user: BaseUser) => void;
  onSendRequest: (receiverId: number) => void;
  onViewFriendRequests: () => void;
  onViewMessageRequests: () => void;
  onSignOut: () => void;
}

export interface ChatEmptyStateProps {
  view: string;
}

export interface FriendListProps {
  friends: Friend[];
  loading: boolean;
  selectedFriendId?: number;
  unreadCounts: Record<number, number>;
  onSelect: (friend: Friend) => void;
}

export interface MessageRequestListProps {
  messageRequests: MessageRequestGroup[];
  onBack: () => void;
}

export interface NotificationToastProps {
  notification: ToastNotification | null;
  onClose: () => void;
  onClick: (senderId: number) => void;
}

export interface RequestListProps {
  pendingRequests: PendingRequest[];
  onAccept: (requestId: number) => void;
  onReject: (requestId: number) => void;
  onBack: () => void;
}

export interface SearchPanelProps {
  searchQuery: string;
  searchResults: SearchedUser[];
  searchLoading: boolean;
  searchDone: boolean;
  onSearch: (q: string) => void;
  onSelect: (user: BaseUser) => void;
  onSendRequest: (receiverId: number) => void;
  onBack: () => void;
}

export interface SearchSuggestionsProps {
  results: SearchedUser[];
  onSelect: (user: BaseUser) => void;
  onSendRequest: (receiverId: number) => void;
}
