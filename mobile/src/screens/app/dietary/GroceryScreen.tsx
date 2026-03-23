import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SectionList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppNavigation } from '@/navigation/useAppNavigation';
import { Text } from 'react-native';
import { Button } from '@/components/common/Button';
import { AppHeader } from '@/components/layout/AppHeader';

const COLORS = {
  primary: '#6366F1',
  text: '#1E293B',
  secondaryText: '#64748B',
  background: '#F8FAFC',
  border: '#E2E8F0',
  success: '#10B981',
};

const MOCK_ITEMS = [
  {
    category: 'Vegetables',
    data: [
      { id: '1', name: 'Broccoli', checked: false },
      { id: '2', name: 'Carrots', checked: true },
      { id: '3', name: 'Spinach', checked: false },
    ],
  },
  {
    category: 'Proteins',
    data: [
      { id: '4', name: 'Chicken Breast', checked: false },
      { id: '5', name: 'Ground Beef', checked: true },
      { id: '6', name: 'Salmon', checked: false },
    ],
  },
  {
    category: 'Grains',
    data: [
      { id: '7', name: 'Brown Rice', checked: true },
      { id: '8', name: 'Oats', checked: false },
    ],
  },
];

export function GroceryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useAppNavigation();
  const [items, setItems] = useState(MOCK_ITEMS);
  const [newItem, setNewItem] = useState('');

  const handleToggleItem = (categoryIdx: number, itemIdx: number) => {
    const updatedItems = [...items];
    updatedItems[categoryIdx].data[itemIdx].checked =
      !updatedItems[categoryIdx].data[itemIdx].checked;
    setItems(updatedItems);
  };

  const handleAddItem = () => {
    if (!newItem.trim()) return;
    // In a real app, this would add to the first category or prompt for category
    setNewItem('');
  };

  const renderGroceryItem = (item: any, categoryIdx: number, itemIdx: number) => (
    <TouchableOpacity
      style={styles.groceryItem}
      onPress={() => handleToggleItem(categoryIdx, itemIdx)}
    >
      <View
        style={[
          styles.checkbox,
          item.checked && styles.checkboxChecked,
        ]}
      >
        {item.checked && (
          <Ionicons name="checkmark" size={14} color="#fff" />
        )}
      </View>
      <Text
        style={[
          styles.itemName,
          item.checked && styles.itemNameChecked,
        ]}
      >
        {item.name}
      </Text>
      <TouchableOpacity style={styles.itemRemove}>
        <Ionicons name="close" size={16} color={COLORS.secondaryText} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: any) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.category}</Text>
      <Text style={styles.itemCount}>{section.data.length}</Text>
    </View>
  );

  const checkedCount = items.reduce(
    (acc, cat) => acc + cat.data.filter((i: any) => i.checked).length,
    0
  );
  const totalCount = items.reduce((acc, cat) => acc + cat.data.length, 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppHeader title="Grocery List" subtitle={`${checkedCount}/${totalCount} items`} />

      <View style={styles.header}>
        <View style={styles.addItemInput}>
          <Ionicons name="add" size={20} color={COLORS.primary} />
          <TextInput
            style={styles.input}
            placeholder="Add item..."
            value={newItem}
            onChangeText={setNewItem}
            placeholderTextColor={COLORS.secondaryText}
          />
        </View>
        <Button
          title="Add"
          size="sm"
          onPress={handleAddItem}
          disabled={!newItem.trim()}
        />
      </View>

      <SectionList
        sections={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index, section }) => {
          const categoryIdx = items.findIndex((cat) => cat.category === section.category);
          return renderGroceryItem(item, categoryIdx, index);
        }}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  addItemInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: COLORS.background,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    paddingVertical: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  itemCount: {
    fontSize: 12,
    color: COLORS.secondaryText,
    fontWeight: '600',
  },
  groceryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 6,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  itemName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: COLORS.secondaryText,
  },
  itemRemove: {
    padding: 4,
  },
});
