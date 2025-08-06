import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from 'react-native';

export default function WelcomeScreen({ navigation }) {
  const handleGetStarted = () => {
    navigation.navigate('GoalScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💰</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.heroSection}>
          <Text style={styles.heroIcon}>📊</Text>
          <Text style={styles.heroTitle}>¡Bienvenido a Budget Tracker!</Text>
          <Text style={styles.heroSubtitle}>
            Tu compañero personal para manejar tus finanzas de manera inteligente
          </Text>
        </View>

        <View style={styles.featuresSection}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📈</Text>
            <Text style={styles.featureText}>Rastrea tus ingresos y gastos</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📁</Text>
            <Text style={styles.featureText}>Organiza por categorías</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureText}>Alcanza tus metas financieras</Text>
          </View>
        </View>
      </View>

      {/* Action Button */}
      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
          <Text style={styles.getStartedText}>Comenzar</Text>
        </TouchableOpacity>
        
        <Text style={styles.skipText}>
          Configuración rápida • 2 minutos
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 48,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  heroIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 36,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresSection: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  featureText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    flex: 1,
  },
  actionSection: {
    padding: 30,
    paddingBottom: 60,
  },
  getStartedButton: {
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
  getStartedText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipText: {
    color: '#e2e8f0',
    fontSize: 14,
    textAlign: 'center',
  },
}); 