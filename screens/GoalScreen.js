import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trackGoalSet } from '../src/analytics/index.js';

export default function GoalScreen({ navigation }) {
  const [selectedGoal, setSelectedGoal] = useState(null);

  const goals = [
    {
      id: 'save',
      icon: '💰',
      title: 'Ahorrar dinero',
      description: 'Quiero guardar más dinero cada mes',
      color: '#16a34a'
    },
    {
      id: 'track',
      icon: '📊',
      title: 'Controlar gastos',
      description: 'Quiero saber en qué gasto mi dinero',
      color: '#16a34a'
    },
    {
      id: 'budget',
      icon: '📈',
      title: 'Mejorar presupuesto',
      description: 'Quiero crear y seguir un presupuesto',
      color: '#16a34a'
    },
    {
      id: 'all',
      icon: '🎯',
      title: 'Todos los anteriores',
      description: 'Quiero mejorar en todos los aspectos',
      color: '#16a34a'
    }
  ];

  const handleGoalSelect = (goal) => {
    setSelectedGoal(goal);
  };

  const handleNext = async () => {
    if (selectedGoal) {
      // Save goal to AsyncStorage
      AsyncStorage.setItem('userGoal', JSON.stringify(selectedGoal));
      
      // Track analytics event
      await trackGoalSet(0, selectedGoal.id); // Using 0 as default amount since it's a goal type selection
      
      navigation.navigate('CategorySetupScreen');
    }
  };

  const handleBack = () => {
    navigation.goBack();
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
          <Text style={styles.progressText}>2 de 4</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>¿Cuál es tu objetivo financiero principal?</Text>
        <Text style={styles.subtitle}>
          Esto nos ayudará a personalizar tu experiencia
        </Text>

        <View style={styles.goalsContainer}>
          {goals.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalCard,
                selectedGoal?.id === goal.id && styles.goalCardSelected,
                selectedGoal?.id === goal.id && { borderColor: goal.color }
              ]}
              onPress={() => handleGoalSelect(goal)}
            >
              <View style={styles.goalHeader}>
                <Text style={styles.goalIcon}>{goal.icon}</Text>
                <View style={[
                  styles.selectionIndicator,
                  selectedGoal?.id === goal.id && { backgroundColor: goal.color }
                ]}>
                  {selectedGoal?.id === goal.id && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </View>
              <Text style={styles.goalTitle}>{goal.title}</Text>
              <Text style={styles.goalDescription}>{goal.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Action Button */}
      <View style={styles.actionSection}>
        <TouchableOpacity 
          style={[styles.nextButton, !selectedGoal && styles.nextButtonDisabled]} 
          onPress={handleNext}
          disabled={!selectedGoal}
        >
          <Text style={styles.nextButtonText}>Siguiente</Text>
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
  goalsContainer: {
    gap: 16,
  },
  goalCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  goalCardSelected: {
    borderWidth: 2,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalIcon: {
    fontSize: 32,
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 6,
  },
  goalDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
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
}); 