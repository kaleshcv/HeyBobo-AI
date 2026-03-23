import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Text } from 'react-native';
import { Button } from '@/components/common/Button';
import { useAiTutorStore } from '@/store/aiTutorStore';
import {
  useConversations,
  useCreateConversation,
  useStreamMessage,
} from '@/hooks/useAI';

const COLORS = {
  primary: '#6366F1',
  text: '#1E293B',
  secondaryText: '#64748B',
  background: '#F8FAFC',
  border: '#E2E8F0',
};

export function AITutorScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();
  const [messageText, setMessageText] = useState('');
  const [showConversations, setShowConversations] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const { activeConversation, streamingText, setActive: setActiveConversation } =
    useAiTutorStore();
  const { data: conversations } = useConversations();
  const { mutate: createConversation } = useCreateConversation();
  const { mutate: streamMessage, isPending: isStreaming } = useStreamMessage();

  // Mock messages for current conversation
  const [messages, setMessages] = useState<
    Array<{ id: string; role: 'user' | 'assistant'; content: string }>
  >([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am your AI Tutor. I am here to help you learn and answer any questions you have. What would you like to discuss today?',
    },
  ]);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages, streamingText]);

  const handleNewConversation = () => {
    createConversation({}, {
      onSuccess: (conversation) => {
        setActiveConversation(conversation);
        setMessages([
          {
            id: Math.random().toString(),
            role: 'assistant',
            content: 'Hello! I am your AI Tutor. How can I help you today?',
          },
        ]);
      },
    });
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Math.random().toString(),
      role: 'user' as const,
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessageText('');

    streamMessage(
      messageText,
      {
        onSuccess: () => {
          // Add assistant response
          setMessages((prev) => [
            ...prev,
            {
              id: Math.random().toString(),
              role: 'assistant',
              content: streamingText,
            },
          ]);
        },
      }
    );
  };

  const renderMessage = ({ item }: { item: (typeof messages)[0] }) => {
    const isUser = item.role === 'user';

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.messageContainerUser : styles.messageContainerAssistant,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.messageBubbleUser : styles.messageBubbleAssistant,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.messageTextUser : styles.messageTextAssistant,
            ]}
          >
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  const renderConversation = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        activeConversation === item.id && styles.conversationItemActive,
      ]}
      onPress={() => {
        setActiveConversation(item.id);
        setShowConversations(false);
      }}
    >
      <Ionicons name="chatbox" size={16} color={COLORS.primary} />
      <Text style={styles.conversationTitle} numberOfLines={1}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>AI Tutor</Text>
          <Text style={styles.headerSubtitle}>
            {activeConversation ? 'Chat' : 'New Conversation'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setShowConversations(!showConversations)}>
          <Ionicons name="chatbubbles" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Conversations Panel */}
      {showConversations && (
        <View style={styles.conversationsPanel}>
          <View style={styles.conversationsPanelHeader}>
            <Text style={styles.conversationsPanelTitle}>Conversations</Text>
            <Button
              title="New"
              size="sm"
              onPress={handleNewConversation}
            />
          </View>

          <FlatList
            data={conversations || []}
            renderItem={renderConversation}
            keyExtractor={(item) => item.id}
            scrollEnabled
            style={styles.conversationsList}
          />
        </View>
      )}

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        scrollEnabled
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      {/* Streaming Response */}
      {streamingText && (
        <View style={styles.streamingContainer}>
          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>{streamingText}</Text>
          </View>
        </View>
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputField}>
          <TextInput
            style={styles.input}
            placeholder="Ask a question..."
            value={messageText}
            onChangeText={setMessageText}
            placeholderTextColor={COLORS.secondaryText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity disabled={isStreaming}>
            <Ionicons
              name="mic"
              size={20}
              color={isStreaming ? COLORS.border : COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}
          disabled={!messageText.trim() || isStreaming}
        >
          <Ionicons
            name="send"
            size={20}
            color={messageText.trim() && !isStreaming ? '#fff' : COLORS.border}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  conversationsPanel: {
    height: 200,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  conversationsPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  conversationsPanelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  conversationsList: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: `${COLORS.primary}08`,
    gap: 10,
  },
  conversationItemActive: {
    backgroundColor: `${COLORS.primary}20`,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  conversationTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  messagesList: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'flex-end',
  },
  messageContainer: {
    marginVertical: 8,
    flexDirection: 'row',
  },
  messageContainerUser: {
    justifyContent: 'flex-end',
  },
  messageContainerAssistant: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
  },
  messageBubbleUser: {
    backgroundColor: COLORS.primary,
  },
  messageBubbleAssistant: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextUser: {
    color: '#fff',
  },
  messageTextAssistant: {
    color: COLORS.text,
  },
  streamingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 12 + 8, // Account for safe area
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  inputField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    maxHeight: 100,
    paddingVertical: 4,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
