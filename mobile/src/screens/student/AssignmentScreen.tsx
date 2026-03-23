import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { useRoute } from '@react-navigation/native';
import { Text } from 'react-native';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import * as DocumentPicker from 'expo-document-picker';

const COLORS = {
  primary: '#6366F1',
  text: '#1E293B',
  secondaryText: '#64748B',
  background: '#F8FAFC',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
};

export function AssignmentScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();
  const route = useRoute();
  const { assignmentId } = route.params as { assignmentId: string };

  const [submissionText, setSubmissionText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock assignment data
  const assignment = {
    id: assignmentId,
    title: 'React Hooks Implementation',
    description:
      'Create a custom React hook that manages a todo list with add, delete, and update functionality. Document your code and provide test cases.',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    points: 50,
    submitted: false,
    submissionDate: null,
    feedback: null,
    grade: null,
  };

  const handleAttachFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync();
      if (!result.canceled) {
        setAttachedFiles((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            name: result.assets?.[0]?.name || 'Document',
            size: result.assets?.[0]?.size || 0,
            uri: result.assets?.[0]?.uri,
          },
        ]);
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleSubmit = async () => {
    if (!submissionText.trim() && attachedFiles.length === 0) {
      alert('Please provide submission text or attach files');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate submission
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert('Assignment submitted successfully!');
      navigation.goBack();
    } catch (err) {
      alert('Error submitting assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isDueSoon =
    assignment.dueDate.getTime() - Date.now() < 24 * 60 * 60 * 1000;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assignment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Assignment Details */}
        <Card padding="lg">
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.assignmentTitle}>{assignment.title}</Text>
              <Text style={styles.pointsText}>{assignment.points} points</Text>
            </View>
            {assignment.submitted ? (
              <View style={styles.submittedBadge}>
                <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
              </View>
            ) : null}
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={16} color={COLORS.primary} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.detailLabel}>Due Date</Text>
                <Text
                  style={[
                    styles.detailValue,
                    isDueSoon && { color: COLORS.warning },
                  ]}
                >
                  {formatDate(assignment.dueDate)}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="document" size={16} color={COLORS.primary} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.detailLabel}>Status</Text>
                <Text style={styles.detailValue}>
                  {assignment.submitted ? 'Submitted' : 'Not Submitted'}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.description}>{assignment.description}</Text>
        </Card>

        {/* Submission Form */}
        {!assignment.submitted && (
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Your Submission</Text>

            <Card padding="lg">
              <Text style={styles.label}>Submission Text</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Enter your submission here..."
                value={submissionText}
                onChangeText={setSubmissionText}
                multiline
                numberOfLines={8}
                placeholderTextColor={COLORS.secondaryText}
                textAlignVertical="top"
              />

              <View style={styles.divider} />

              <View style={styles.filesSection}>
                <View style={styles.filesHeader}>
                  <Text style={styles.label}>Attachments</Text>
                  <TouchableOpacity
                    style={styles.attachButton}
                    onPress={handleAttachFile}
                  >
                    <Ionicons name="attach" size={16} color={COLORS.primary} />
                    <Text style={styles.attachButtonText}>Add File</Text>
                  </TouchableOpacity>
                </View>

                {attachedFiles.length > 0 ? (
                  <View style={styles.filesList}>
                    {attachedFiles.map((file) => (
                      <View key={file.id} style={styles.fileItem}>
                        <Ionicons
                          name="document"
                          size={16}
                          color={COLORS.primary}
                        />
                        <View style={styles.fileInfo}>
                          <Text style={styles.fileName}>{file.name}</Text>
                          <Text style={styles.fileSize}>
                            {formatFileSize(file.size)}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleRemoveFile(file.id)}
                        >
                          <Ionicons name="close" size={20} color={COLORS.primary} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadPlaceholder}
                    onPress={handleAttachFile}
                  >
                    <Ionicons name="cloud-upload" size={24} color={COLORS.primary} />
                    <Text style={styles.uploadText}>Tap to attach files</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Button
                title="Submit Assignment"
                onPress={handleSubmit}
                loading={isSubmitting}
                fullWidth
                style={{ marginTop: 24 }}
              />
            </Card>
          </View>
        )}

        {/* Submission History */}
        {assignment.submitted && (
          <View style={styles.historySection}>
            <Text style={styles.formTitle}>Submission History</Text>

            <Card padding="lg">
              <View style={styles.submissionItem}>
                <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.submissionDate}>
                    Submitted on {formatDate(new Date(assignment.submissionDate!))}
                  </Text>
                  {assignment.grade && (
                    <Text style={styles.grade}>
                      Grade: {assignment.grade}/{assignment.points} points
                    </Text>
                  )}
                </View>
              </View>

              {assignment.feedback && (
                <View style={styles.feedbackBox}>
                  <Text style={styles.feedbackTitle}>Feedback</Text>
                  <Text style={styles.feedbackText}>{assignment.feedback}</Text>
                </View>
              )}
            </Card>
          </View>
        )}
      </ScrollView>
    </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  assignmentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  submittedBadge: {
    padding: 8,
  },
  detailsGrid: {
    gap: 12,
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 16,
  },
  description: {
    fontSize: 14,
    color: COLORS.secondaryText,
    lineHeight: 20,
  },
  formSection: {
    marginTop: 24,
    marginBottom: 32,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 14,
    fontFamily: 'System',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  filesSection: {
    marginBottom: 16,
  },
  filesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 6,
    gap: 6,
  },
  attachButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  filesList: {
    gap: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: `${COLORS.primary}05`,
    gap: 10,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  fileSize: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  uploadPlaceholder: {
    alignItems: 'center',
    paddingVertical: 32,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    borderStyle: 'dashed',
    backgroundColor: `${COLORS.primary}05`,
  },
  uploadText: {
    fontSize: 14,
    color: COLORS.secondaryText,
    marginTop: 8,
  },
  historySection: {
    marginBottom: 32,
  },
  submissionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  submissionDate: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  grade: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  feedbackBox: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  feedbackTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 13,
    color: COLORS.secondaryText,
    lineHeight: 20,
  },
});
