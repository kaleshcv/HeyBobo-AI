import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Modal,
  FlatList,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useInjuryStore } from '@/store/injuryStore'
import { AppHeader } from '@/components/layout/AppHeader'
import T from '@/theme'

const BODY_PARTS = [
  'head', 'neck', 'shoulder-left', 'shoulder-right', 'upper-back', 'lower-back', 'chest',
  'elbow-left', 'elbow-right', 'wrist-left', 'wrist-right', 'hip-left', 'hip-right',
  'knee-left', 'knee-right', 'ankle-left', 'ankle-right', 'foot-left', 'foot-right',
] as const

const INJURY_TYPES = [
  'muscle-strain', 'ligament-sprain', 'fracture', 'joint-pain', 'tendinitis',
  'bruise', 'nerve-pain', 'posture-related', 'overuse', 'other',
] as const

const SEVERITY_OPTIONS = ['mild', 'moderate', 'severe'] as const
const STATUS_OPTIONS = ['active', 'recovering', 'healed'] as const

export function InjuryTrackingScreen() {
  const insets = useSafeAreaInsets()
  const { injuries, activeInjuries, addInjury, updateStatus, updatePainLevel } = useInjuryStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedBodyPart, setSelectedBodyPart] = useState<any>(null)
  const [selectedBodyPartModal, setSelectedBodyPartModal] = useState(false)

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild':
        return T.orange
      case 'moderate':
        return T.red
      case 'severe':
        return '#991B1B'
      default:
        return T.muted
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return 'alert-circle'
      case 'recovering':
        return 'heart'
      case 'healed':
        return 'checkmark-circle'
      default:
        return 'help-circle'
    }
  }

  const renderInjuryCard = ({ item }: { item: any }) => (
    <View style={[styles.injuryCard, { borderLeftColor: getSeverityColor(item.severity), borderLeftWidth: 4 }]}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.injuryBody}>{item.bodyPart.replace('-', ' ').toUpperCase()}</Text>
          <Text style={styles.injuryType}>{item.type.replace('-', ' ')}</Text>
        </View>
        <View style={[styles.severityBadge, { backgroundColor: `${getSeverityColor(item.severity)}20` }]}>
          <Text style={[styles.severityText, { color: getSeverityColor(item.severity) }]}>
            {item.severity.charAt(0).toUpperCase() + item.severity.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.painLevelSection}>
        <View style={styles.painHeader}>
          <Text style={styles.painLabel}>Pain Level</Text>
          <Text style={styles.painValue}>{item.painLevel}/10</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 4, marginTop: 8 }}>
          {[1,2,3,4,5,6,7,8,9,10].map((level) => (
            <TouchableOpacity
              key={level}
              onPress={() => updatePainLevel(item.id, level)}
              style={{
                flex: 1, height: 28, borderRadius: 4, alignItems: 'center', justifyContent: 'center',
                backgroundColor: level <= item.painLevel
                  ? level <= 3 ? T.green : level <= 6 ? T.orange : T.red
                  : T.border2,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: level <= item.painLevel ? T.white : T.muted }}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.statusRow}>
        <View style={styles.statusBadge}>
          <Ionicons name={getStatusIcon(item.status) as any} size={14} color={T.primary2} />
          <Text style={styles.statusText}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Text>
        </View>
        {item.affectsWorkout && (
          <View style={[styles.statusBadge, { backgroundColor: '#ef444422' }]}>
            <Ionicons name="warning" size={14} color={T.red} />
            <Text style={[styles.statusText, { color: T.red }]}>Affects Workout</Text>
          </View>
        )}
      </View>

      {item.description && <Text style={styles.description}>{item.description}</Text>}
      {item.notes.length > 0 && (
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>Progress Notes</Text>
          {item.notes.map((note: string, idx: number) => (
            <Text key={idx} style={styles.note}>
              • {note}
            </Text>
          ))}
        </View>
      )}
    </View>
  )

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Injury Tracking" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeInjuries().length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Active Injuries ({activeInjuries().length})</Text>
            <FlatList
              data={activeInjuries()}
              renderItem={renderInjuryCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={48} color={T.green} />
            <Text style={styles.emptyText}>No active injuries</Text>
            <Text style={styles.emptySubtext}>Stay healthy!</Text>
          </View>
        )}

        {injuries.filter((i) => i.status === 'healed').length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recovery Tips</Text>
            <View style={styles.tipsCard}>
              <Text style={styles.tipTitle}>Recovery Advice</Text>
              <Text style={styles.tipText}>• Rest and elevate the injured area</Text>
              <Text style={styles.tipText}>• Apply ice for 15-20 minutes</Text>
              <Text style={styles.tipText}>• Gentle stretching when ready</Text>
              <Text style={styles.tipText}>• Physical therapy exercises</Text>
            </View>
          </>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 16 }]}
        onPress={() => {
          setShowAddModal(true)
          setSelectedBodyPartModal(true)
        }}
      >
        <Ionicons name="add" size={24} color={T.white} />
      </TouchableOpacity>

      <Modal
        visible={selectedBodyPartModal && showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setSelectedBodyPartModal(false)
          setShowAddModal(false)
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Body Part</Text>
            <FlatList
              data={BODY_PARTS}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.bodyPartOption}
                  onPress={() => {
                    setSelectedBodyPart(item)
                    setSelectedBodyPartModal(false)
                  }}
                >
                  <Text style={styles.bodyPartText}>{item.replace('-', ' ').toUpperCase()}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item}
              scrollEnabled={true}
              nestedScrollEnabled={true}
            />
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: T.text,
    marginBottom: 12,
    marginTop: 8,
  },
  injuryCard: {
    backgroundColor: T.surface2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: T.border2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  injuryBody: {
    fontSize: 14,
    fontWeight: '700',
    color: T.text,
  },
  injuryType: {
    fontSize: 12,
    color: T.muted,
    marginTop: 2,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  painLevelSection: {
    marginBottom: 12,
  },
  painHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  painLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: T.text,
  },
  painValue: {
    fontSize: 14,
    fontWeight: '700',
    color: T.red,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: T.primary2,
  },
  description: {
    fontSize: 12,
    color: T.muted,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  notesSection: {
    borderTopWidth: 1,
    borderTopColor: T.border2,
    paddingTop: 8,
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: T.text,
    marginBottom: 6,
  },
  note: {
    fontSize: 11,
    color: T.muted,
    marginBottom: 4,
  },
  tipsCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: T.primary2,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    color: T.text,
    marginBottom: 6,
  },
  fab: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: T.primary2,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: T.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: T.muted,
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: T.surface2,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: T.text,
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: T.border2,
  },
  bodyPartOption: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: T.border2,
  },
  bodyPartText: {
    fontSize: 14,
    color: T.text,
    fontWeight: '500',
  },
})
