import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Text } from 'react-native';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import T from '@/theme'

;

const DIET_TYPES = ['Omnivore', 'Vegetarian', 'Vegan', 'Keto', 'Paleo'];
const ALLERGIES = ['Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Soy', 'Fish'];

export function DietaryProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();

  const [dietType, setDietType] = useState('Omnivore');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [calorieGoal, setCalorieGoal] = useState('2000');
  const [showDietPicker, setShowDietPicker] = useState(false);

  const toggleAllergy = (allergy: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(allergy)
        ? prev.filter((a) => a !== allergy)
        : [...prev, allergy]
    );
  };

  const handleSaveProfile = () => {
    alert('Dietary profile saved!');
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={T.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dietary Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Diet Type */}
        <Card padding="lg" style={{ marginBottom: 20 }}>
          <Text style={styles.label}>Diet Type</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowDietPicker(true)}
          >
            <Text style={styles.selectorText}>{dietType}</Text>
            <Ionicons name="chevron-down" size={20} color={T.primary2} />
          </TouchableOpacity>

          <View style={styles.dietTypesGrid}>
            {DIET_TYPES.map((diet) => (
              <TouchableOpacity
                key={diet}
                style={[
                  styles.dietTypeButton,
                  dietType === diet && styles.dietTypeButtonActive,
                ]}
                onPress={() => setDietType(diet)}
              >
                <Text
                  style={[
                    styles.dietTypeText,
                    dietType === diet && styles.dietTypeTextActive,
                  ]}
                >
                  {diet}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Allergies */}
        <Card padding="lg" style={{ marginBottom: 20 }}>
          <Text style={styles.label}>Allergies & Restrictions</Text>
          <View style={styles.allergiesGrid}>
            {ALLERGIES.map((allergy) => (
              <TouchableOpacity
                key={allergy}
                style={[
                  styles.allergyChip,
                  selectedAllergies.includes(allergy) && styles.allergyChipActive,
                ]}
                onPress={() => toggleAllergy(allergy)}
              >
                <Text
                  style={[
                    styles.allergyChipText,
                    selectedAllergies.includes(allergy) &&
                      styles.allergyChipTextActive,
                  ]}
                >
                  {allergy}
                </Text>
                {selectedAllergies.includes(allergy) && (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Calorie Goal */}
        <Card padding="lg" style={{ marginBottom: 20 }}>
          <Text style={styles.label}>Daily Calorie Goal (kcal)</Text>
          <TextInput
            style={styles.input}
            placeholder="2000"
            value={calorieGoal}
            onChangeText={setCalorieGoal}
            keyboardType="decimal-pad"
          />
          <Text style={styles.helperText}>Recommended: 1500-2500 kcal</Text>
        </Card>

        {/* Preferences */}
        <Card padding="lg" style={{ marginBottom: 32 }}>
          <Text style={styles.label}>Food Preferences</Text>
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceName}>Organic Products</Text>
            <View style={styles.toggle}>
              <View style={[styles.toggleSwitch, { left: 2 }]} />
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceName}>Low Sugar Options</Text>
            <View style={[styles.toggle, styles.toggleActive]}>
              <View style={[styles.toggleSwitch, { left: 18 }]} />
            </View>
          </View>
        </Card>

        <Button title="Save Changes" onPress={handleSaveProfile} fullWidth />
      </ScrollView>

      {/* Diet Type Modal */}
      <Modal visible={showDietPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Diet Type</Text>
              <TouchableOpacity onPress={() => setShowDietPicker(false)}>
                <Ionicons name="close" size={24} color={T.text} />
              </TouchableOpacity>
            </View>
            {DIET_TYPES.map((diet) => (
              <TouchableOpacity
                key={diet}
                style={styles.modalOption}
                onPress={() => {
                  setDietType(diet);
                  setShowDietPicker(false);
                }}
              >
                <Text style={styles.modalOptionText}>{diet}</Text>
                {dietType === diet && (
                  <Ionicons name="checkmark" size={20} color={T.primary2} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: T.border2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: T.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: T.text,
    marginBottom: 10,
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: T.border2,
    borderRadius: 8,
    backgroundColor: '#111827',
    marginBottom: 12,
  },
  selectorText: {
    fontSize: 14,
    fontWeight: '500',
    color: T.text,
  },
  dietTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dietTypeButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: T.border2,
    backgroundColor: '#111827',
    alignItems: 'center',
  },
  dietTypeButtonActive: {
    backgroundColor: T.primary2,
    borderColor: T.primary2,
  },
  dietTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: T.text,
  },
  dietTypeTextActive: {
    color: '#fff',
  },
  allergiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: T.border2,
    backgroundColor: '#111827',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  allergyChipActive: {
    backgroundColor: T.primary2,
    borderColor: T.primary2,
  },
  allergyChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: T.text,
  },
  allergyChipTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: T.border2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: T.text,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 11,
    color: T.muted,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  preferenceName: {
    fontSize: 14,
    fontWeight: '500',
    color: T.text,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: T.border2,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: T.primary2,
  },
  toggleSwitch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#111827',
    position: 'absolute',
  },
  divider: {
    height: 1,
    backgroundColor: T.border2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: T.border2,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: T.text,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: T.border2,
  },
  modalOptionText: {
    fontSize: 14,
    color: T.text,
  },
});
