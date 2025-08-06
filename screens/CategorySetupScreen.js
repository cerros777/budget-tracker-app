import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CategorySetupScreen({ navigation }) {
  const [selectedCategories, setSelectedCategories] = useState([]);

  const categoryOptions = [
    { id: 'food', name: 'Comida', icon: '🍕', defaultSelected: true },
    { id: 'transport', name: 'Transporte', icon: '🚗', defaultSelected: true },
    { id: 'shopping', name: 'Compras', icon: '🛍️', defaultSelected: true },
    { id: 'home', name: 'Hogar', icon: '🏠', defaultSelected: true },
    { id: 'health', name: 'Salud', icon: '🏥', defaultSelected: false },
    { id: 'entertainment', name: 'Entretenimiento', icon: '🎮', defaultSelected: false },
    { id: 'work', name: 'Trabajo', icon: '💼', defaultSelected: false },
    { id: 'gifts', name: 'Regalos', icon: '🎁', defaultSelected: false },
    { id: 'education', name: 'Educación', icon: '📚', defaultSelected: false },
    { id: 'sports', name: 'Deportes', icon: '🏋️', defaultSelected: false },
    { id: 'hobbies', name: 'Hobbies', icon: '🎨', defaultSelected: false },
    { id: 'pets', name: 'Mascotas', icon: '🐕', defaultSelected: false },
    { id: 'smoking', name: 'Fumar', icon: '🚬', defaultSelected: false },
    { id: 'alcohol', name: 'Alcohol', icon: '🍺', defaultSelected: false },
    { id: 'gambling', name: 'Juegos', icon: '🎰', defaultSelected: false },
    { id: 'cards', name: 'Tarjetas', icon: '💳', defaultSelected: false },
    { id: 'bank', name: 'Banco', icon: '🏦', defaultSelected: false },
    { id: 'technology', name: 'Tecnología', icon: '📱', defaultSelected: false },
    { id: 'travel', name: 'Viajes', icon: '✈️', defaultSelected: false },
    { id: 'music', name: 'Música', icon: '🎵', defaultSelected: false },
  ];

  // Initialize with default selected categories
  React.useEffect(() => {
    const defaultSelected = categoryOptions.filter(cat => cat.defaultSelected);
    setSelectedCategories(defaultSelected);
  }, []);

  const handleCategoryToggle = (category) => {
    const isSelected = selectedCategories.find(cat => cat.id === category.id);
    
    if (isSelected) {
      setSelectedCategories(selectedCategories.filter(cat => cat.id !== category.id));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleNext = async () => {
    if (selectedCategories.length > 0) {
      // Save selected categories to AsyncStorage
      await AsyncStorage.setItem('selectedCategories', JSON.stringify(selectedCategories));
      
      // Create the categories in the main app storage
      const existingCategories = await AsyncStorage.getItem('categories');
      const currentCategories = existingCategories ? JSON.parse(existingCategories) : [];
      
      // Create new categories from selected ones
      const newCategories = selectedCategories.map(category => ({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // Unique ID
        name: category.name,
        icon: category.icon,
        transactions: [],
      }));
      
      // Combine existing and new categories
      const updatedCategories = [...currentCategories, ...newCategories];
      await AsyncStorage.setItem('categories', JSON.stringify(updatedCategories));
      
      navigation.navigate('SuccessScreen');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSkip = () => {
    navigation.navigate('SuccessScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>3 de 4</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Configura tus categorías</Text>
        <Text style={styles.subtitle}>
          Selecciona las categorías que usas más frecuentemente
        </Text>

        <View style={styles.categoriesContainer}>
          {categoryOptions.map((category) => {
            const isSelected = selectedCategories.find(cat => cat.id === category.id);
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  isSelected && styles.categoryCardSelected
                ]}
                onPress={() => handleCategoryToggle(category)}
              >
                <View style={styles.categoryIconContainer}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  {isSelected && (
                    <View style={styles.selectedIndicator}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity 
          style={[styles.nextButton, selectedCategories.length === 0 && styles.nextButtonDisabled]} 
          onPress={handleNext}
          disabled={selectedCategories.length === 0}
        >
          <Text style={styles.nextButtonText}>
            Continuar ({selectedCategories.length} seleccionadas)
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Saltar por ahora</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#667eea',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  backIcon: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  progressContainer: {
    flex: 1,
  },
  progressText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    paddingBottom: 60, // Add padding to the bottom of the ScrollView
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 30,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryCardSelected: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryIconContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 32,
  },
  selectedIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  actionSection: {
    padding: 20,
    paddingBottom: 60,
  },
  nextButton: {
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    padding: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
}); 