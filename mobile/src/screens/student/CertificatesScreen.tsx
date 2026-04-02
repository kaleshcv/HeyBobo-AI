import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Text } from 'react-native';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/EmptyState';
import { AppHeader } from '@/components/layout/AppHeader';
import T from '@/theme'

// Mock certificates data
const MOCK_CERTIFICATES = [
  {
    id: '1',
    courseName: 'React Native Development',
    issueDate: new Date(2024, 0, 15),
    certificateNumber: 'CERT-2024-001',
    grade: 'A',
    instructor: 'John Doe',
  },
  {
    id: '2',
    courseName: 'Advanced JavaScript',
    issueDate: new Date(2023, 11, 20),
    certificateNumber: 'CERT-2023-042',
    grade: 'A',
    instructor: 'Jane Smith',
  },
  {
    id: '3',
    courseName: 'Web Design Fundamentals',
    issueDate: new Date(2023, 10, 5),
    certificateNumber: 'CERT-2023-038',
    grade: 'B+',
    instructor: 'Mike Johnson',
  },
];

export function CertificatesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();

  const handleShare = async (certificate: any) => {
    try {
      await Share.share({
        message: `I just earned a certificate in ${certificate.courseName}! Certificate #${certificate.certificateNumber}`,
        title: 'Share Certificate',
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleDownload = (certificate: any) => {
    alert(`Downloading certificate for ${certificate.courseName}...`);
  };

  const renderCertificate = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.certificateCard}>
      <View style={styles.certificateIcon}>
        <Ionicons name="ribbon" size={40} color={T.primary2} />
      </View>

      <View style={styles.certificateContent}>
        <Text style={styles.courseName} numberOfLines={2}>
          {item.courseName}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar" size={14} color={T.muted} />
            <Text style={styles.metaText}>
              {item.issueDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Ionicons name="star" size={14} color={T.yellow} />
            <Text style={styles.metaText}>{item.grade}</Text>
          </View>
        </View>

        <Text style={styles.certNumber}>ID: {item.certificateNumber}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleShare(item)}
        >
          <Ionicons name="share-social" size={18} color={T.primary2} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDownload(item)}
        >
          <Ionicons name="download" size={18} color={T.primary2} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="My Certificates" subtitle={`${MOCK_CERTIFICATES.length} earned`} />

      {MOCK_CERTIFICATES.length > 0 ? (
        <FlatList
          data={MOCK_CERTIFICATES}
          renderItem={renderCertificate}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="ribbon"
            title="No Certificates Yet"
            description="Complete courses to earn certificates"
            action={{ label: 'Browse Courses', onPress: () => {} }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  certificateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: T.border2,
    gap: 16,
  },
  certificateIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${T.primary2}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  certificateContent: {
    flex: 1,
  },
  courseName: {
    fontSize: 15,
    fontWeight: '600',
    color: T.text,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: T.muted,
  },
  certNumber: {
    fontSize: 11,
    color: T.muted,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${T.primary2}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
