import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Text } from 'react-native';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { useLogMeal, useSearchFood } from '@/hooks/useDietary';
import { MealType } from '@/types';
import * as DocumentPicker from 'expo-document-picker';
import T from '@/theme'

;

const MEAL_TYPES: { label: string; value: MealType }[] = [
  { label: 'Breakfast', value: MealType.BREAKFAST },
  { label: 'Lunch', value: MealType.LUNCH },
  { label: 'Dinner', value: MealType.DINNER },
  { label: 'Snack', value: MealType.SNACK },
];

export function MealLogScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();

  const [foodSearch, setFoodSearch] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<MealType>(MealType.BREAKFAST);
  const [quantity, setQuantity] = useState('100');
  const [showMealTypePicker, setShowMealTypePicker] = useState(false);
  const [showFoodPicker, setShowFoodPicker] = useState(false);
  const [selectedFood, setSelectedFood] = useState<any>(null);

  const { mutate: logMeal, isPending } = useLogMeal();
  const { data: foodResults } = useSearchFood(foodSearch);

  const MOCK_FOODS = [
    { id: '1', name: 'Oatmeal', calories: 150, protein: 5, carbs: 27 },
    { id: '2', name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0 },
    { id: '3', name: 'Apple', calories: 95, protein: 0.5, carbs: 25 },
    { id: '4', name: 'Brown Rice', calories: 111, protein: 2.6, carbs: 23 },
  ];

  const handleLogMeal = () => {
    if (!selectedFood) {
      alert('Please select a food');
      return;
    }

    logMeal({
      foodItemId: selectedFood.id,
      date: new Date().toISOString().split('T')[0],
      mealType: selectedMealType,
      quantity: parseFloat(quantity),
    });
  };

  const renderFoodOption = ({ item }: { item: (typeof MOCK_FOODS)[0] }) => (
    <TouchableOpacity
      style={styles.foodOption}
      onPress={() => {
        setSelectedFood(item);
        setShowFoodPicker(false);
      }}
    >
      <View>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodNutrients}>
          {item.calories} kcal • P: {item.protein}g • C: {item.carbs}g
        </Text>
      </View>
      {selectedFood?.id === item.id && (
        <Ionicons name="checkmark" size={20} color={T.primary2} />
      )}
    </TouchableOpacity>
  );

  const calculateNutrients = () => {
    if (!selectedFood) return null;
    const multiplier = parseFloat(quantity) / 100;
    return {
      calories: Math.round(selectedFood.calories * multiplier),
      protein: (selectedFood.protein * multiplier).toFixed(1),
      carbs: (selectedFood.carbs * multiplier).toFixed(1),
    };
  };

  const nutrients = calculateNutrients();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={T.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Meal</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Meal Type Selection */}
        <Card padding="lg" style={{ marginBottom: 20 }}>
          <Text style={styles.label}>Meal Type</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowMealTypePicker(true)}
          >
            <Text style={styles.selectorText}>{selectedMealType}</Text>
            <Ionicons name="chevron-down" size={20} color={T.primary2} />
          </TouchableOpacity>
        </Card>

        {/* Food Search & Selection */}
        <Card padding="lg" style={{ marginBottom: 20 }}>
          <Text style={styles.label}>Search Food</Text>

          <View style={styles.searchRow}>
            <View style={styles.searchInput}>
              <Ionicons name="search" size={18} color={T.muted} />
              <TextInput
                style={styles.searchField}
                placeholder="Search for food..."
                value={foodSearch}
                onChangeText={setFoodSearch}
                placeholderTextColor={T.muted}
              />
            </View>
            <TouchableOpacity style={styles.barcodeButton}>
              <Ionicons name="barcode" size={20} color={T.primary2} />
            </TouchableOpacity>
          </View>

          {selectedFood && (
            <View style={styles.selectedFoodBox}>
              <View>
                <Text style={styles.selectedFoodName}>{selectedFood.name}</Text>
                <Text style={styles.selectedFoodDetails}>100g</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedFood(null)}>
                <Ionicons name="close" size={20} color={T.primary2} />
              </TouchableOpacity>
            </View>
          )}

          {!selectedFood && (
            <TouchableOpacity
              style={styles.foodPickerButton}
              onPress={() => setShowFoodPicker(true)}
            >
              <Ionicons name="list" size={18} color={T.primary2} />
              <Text style={styles.foodPickerButtonText}>Browse Foods</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Quantity Input */}
        {selectedFood && (
          <Card padding="lg" style={{ marginBottom: 20 }}>
            <Text style={styles.label}>Quantity (grams)</Text>
            <TextInput
              style={styles.input}
              placeholder="100"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
            />
          </Card>
        )}

        {/* Nutrition Preview */}
        {nutrients && (
          <Card padding="lg" style={{ marginBottom: 20 }}>
            <Text style={styles.label}>Estimated Nutrition</Text>
            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Calories</Text>
                <Text style={styles.nutritionValue}>{nutrients.calories}</Text>
                <Text style={styles.nutritionUnit}>kcal</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Protein</Text>
                <Text style={styles.nutritionValue}>{nutrients.protein}</Text>
                <Text style={styles.nutritionUnit}>g</Text>
              </View>
              <View style={styles.nutritionItem}>
                <Text style={styles.nutritionLabel}>Carbs</Text>
                <Text style={styles.nutritionValue}>{nutrients.carbs}</Text>
                <Text style={styles.nutritionUnit}>g</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Photo Analysis */}
        <Card padding="lg" style={{ marginBottom: 32 }}>
          <TouchableOpacity style={styles.photoButton}>
            <Ionicons name="camera" size={24} color={T.primary2} />
            <Text style={styles.photoButtonText}>AI Analyze Photo</Text>
          </TouchableOpacity>
          <Text style={styles.photoNote}>
            Take a photo of your meal for AI-powered nutrition analysis
          </Text>
        </Card>

        {/* Submit Button */}
        <Button
          title="Log This Meal"
          onPress={handleLogMeal}
          loading={isPending}
          disabled={!selectedFood}
          fullWidth
        />
      </ScrollView>

      {/* Meal Type Picker Modal */}
      <Modal visible={showMealTypePicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Meal Type</Text>
              <TouchableOpacity onPress={() => setShowMealTypePicker(false)}>
                <Ionicons name="close" size={24} color={T.text} />
              </TouchableOpacity>
            </View>
            {MEAL_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={styles.modalOption}
                onPress={() => {
                  setSelectedMealType(type.value);
                  setShowMealTypePicker(false);
                }}
              >
                <Text style={styles.modalOptionText}>{type.label}</Text>
                {selectedMealType === type.value && (
                  <Ionicons name="checkmark" size={20} color={T.primary2} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Food Picker Modal */}
      <Modal visible={showFoodPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Food</Text>
              <TouchableOpacity onPress={() => setShowFoodPicker(false)}>
                <Ionicons name="close" size={24} color={T.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={MOCK_FOODS}
              renderItem={renderFoodOption}
              keyExtractor={(item) => item.id}
            />
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
  },
  selectorText: {
    fontSize: 14,
    fontWeight: '500',
    color: T.text,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: T.border2,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: T.bg,
    gap: 8,
  },
  searchField: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: T.text,
  },
  barcodeButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: T.border2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedFoodBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: `${T.primary2}08`,
    borderWidth: 1,
    borderColor: T.primary2,
    marginBottom: 12,
  },
  selectedFoodName: {
    fontSize: 14,
    fontWeight: '600',
    color: T.text,
  },
  selectedFoodDetails: {
    fontSize: 12,
    color: T.muted,
    marginTop: 2,
  },
  foodPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: T.primary2,
    borderStyle: 'dashed',
    gap: 8,
  },
  foodPickerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: T.primary2,
  },
  input: {
    borderWidth: 1,
    borderColor: T.border2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: T.text,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 12,
    color: T.muted,
    marginBottom: 6,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: '700',
    color: T.text,
  },
  nutritionUnit: {
    fontSize: 11,
    color: T.muted,
    marginTop: 2,
  },
  photoButton: {
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: T.primary2,
    borderStyle: 'dashed',
    marginBottom: 12,
    gap: 8,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: T.primary2,
  },
  photoNote: {
    fontSize: 12,
    color: T.muted,
    textAlign: 'center',
    marginTop: 8,
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
  foodOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: T.border2,
  },
  foodName: {
    fontSize: 14,
    fontWeight: '600',
    color: T.text,
    marginBottom: 4,
  },
  foodNutrients: {
    fontSize: 11,
    color: T.muted,
  },
});
