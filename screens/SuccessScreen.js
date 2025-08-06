import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SuccessScreen({ onComplete }) {
  const handleStartTracking = async () => {
    // Mark onboarding as complete
    await AsyncStorage.setItem('onboardingComplete', 'true');
    
    // Trigger the callback to switch to main app
    onComplete();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>4 de 4</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.celebrationSection}>
          <Text style={styles.celebrationIcon}>🎉</Text>
          <Text style={styles.celebrationTitle}>¡Todo listo!</Text>
          <Text style={styles.celebrationSubtitle}>
            Tu Budget Tracker está configurado y listo para usar
          </Text>
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Consejos para empezar</Text>
          
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>📝</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Registra cada transacción</Text>
              <Text style={styles.tipDescription}>
                Mantén un registro de todos tus ingresos y gastos
              </Text>
            </View>
          </View>
          
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>📊</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Revisa tus resúmenes</Text>
              <Text style={styles.tipDescription}>
                Monitorea tu progreso financiero regularmente
              </Text>
            </View>
          </View>
          
          <View style={styles.tipItem}>
            <Text style={styles.tipIcon}>🎯</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Establece metas</Text>
              <Text style={styles.tipDescription}>
                Define objetivos claros para tus ahorros
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Button */}
      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.startButton} onPress={handleStartTracking}>
          <Text style={styles.startButtonText}>🚀 Comenzar a rastrear</Text>
        </TouchableOpacity>
        
        <Text style={styles.encouragementText}>
          ¡Tu futuro financiero comienza ahora!
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  progressContainer: {
    width: '100%',
  },
  progressText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
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
    justifyContent: 'center',
  },
  celebrationSection: {
    alignItems: 'center',
    marginBottom: 50,
  },
  celebrationIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  celebrationTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 15,
  },
  celebrationSubtitle: {
    fontSize: 18,
    color: '#e2e8f0',
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  tipsSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  tipIcon: {
    fontSize: 24,
    marginRight: 15,
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#e2e8f0',
    lineHeight: 20,
  },
  actionSection: {
    padding: 20,
    paddingBottom: 60,
  },
  startButton: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: 'bold',
  },
  encouragementText: {
    color: '#e2e8f0',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); 