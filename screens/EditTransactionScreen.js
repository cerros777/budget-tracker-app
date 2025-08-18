import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trackExpenseEdited } from '../src/analytics/index.js';

export default function EditTransactionScreen({ route, navigation }) {
  const { transaction, categoryId } = route.params;
  
  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [description, setDescription] = useState(transaction.description);
  const [type, setType] = useState(transaction.type);
  const [selectedDate, setSelectedDate] = useState(transaction.date || getTodayDate());
  const [categories, setCategories] = useState([]);
  const [amountFocused, setAmountFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      const data = await AsyncStorage.getItem('categories');
      if (data) {
        setCategories(JSON.parse(data));
      }
    };
    loadCategories();
  }, []);

  const updateTransaction = async () => {
    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) < 0 || !description.trim()) {
      setShowValidationErrors(true);
      return;
    }
    setShowValidationErrors(false);
    
    const updatedTransaction = {
      ...transaction,
      amount: parseFloat(amount),
      description: description.trim(),
      type,
      date: selectedDate,
    };

    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          transactions: cat.transactions.map(txn => 
            txn.id === transaction.id ? updatedTransaction : txn
          )
        };
      }
      return cat;
    });

    setCategories(updatedCategories);
    
    // Track analytics event
    await trackExpenseEdited(transaction.id);
    
    await AsyncStorage.setItem('categories', JSON.stringify(updatedCategories));
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>✏️ Edit Transaction</Text>
          <Text style={styles.headerSubtitle}>Update transaction details</Text>
        </View>
      </View>

      {/* Form Container */}
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>💰 Amount</Text>
          <TextInput
            style={[
              styles.input,
              amountFocused && styles.inputFocused,
              showValidationErrors && (!amount.trim() || isNaN(Number(amount)) || Number(amount) < 0) && styles.inputError
            ]}
            placeholder="Enter amount..."
            placeholderTextColor="#9ca3af"
            value={amount}
            onChangeText={(text) => {
              // Prevent negative numbers
              const num = parseFloat(text);
              if (text === '' || (num >= 0 && !isNaN(num))) {
                setAmount(text);
              }
            }}
            keyboardType="numeric"
            onFocus={() => setAmountFocused(true)}
            onBlur={() => setAmountFocused(false)}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>📝 Description</Text>
          <TextInput
            style={[
              styles.input,
              descriptionFocused && styles.inputFocused,
              showValidationErrors && !description.trim() && styles.inputError
            ]}
            placeholder="Enter description..."
            placeholderTextColor="#9ca3af"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            onFocus={() => setDescriptionFocused(true)}
            onBlur={() => setDescriptionFocused(false)}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>📅 Date</Text>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => {
              // For now, we'll use a simple date picker
              // In a real app, you might want to use a proper date picker library
              const today = new Date();
              const yesterday = new Date(today);
              yesterday.setDate(today.getDate() - 1);
              
              Alert.alert(
                'Select Date',
                'Choose a date',
                [
                  {
                    text: 'Today',
                    onPress: () => setSelectedDate(getTodayDate())
                  },
                  {
                    text: 'Yesterday',
                    onPress: () => {
                      const yesterdayDate = new Date();
                      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
                      const year = yesterdayDate.getFullYear();
                      const month = String(yesterdayDate.getMonth() + 1).padStart(2, '0');
                      const day = String(yesterdayDate.getDate()).padStart(2, '0');
                      setSelectedDate(`${year}-${month}-${day}`);
                    }
                  },
                  {
                    text: 'Cancel',
                    style: 'cancel'
                  }
                ]
              );
            }}
          >
            <Text style={styles.dateButtonText}>{selectedDate}</Text>
            <Text style={styles.dateButtonIcon}>📅</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>📊 Transaction Type</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'expense' && styles.typeButtonActive
              ]}
              onPress={() => setType('expense')}
            >
              <Text style={styles.typeIcon}>💸</Text>
              <Text style={[styles.typeButtonText, type === 'expense' && styles.typeButtonTextActive]}>
                Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === 'income' && styles.typeButtonActive
              ]}
              onPress={() => setType('income')}
            >
              <Text style={styles.typeIcon}>💰</Text>
              <Text style={[styles.typeButtonText, type === 'income' && styles.typeButtonTextActive]}>
                Income
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.updateButton, (!amount.trim() || isNaN(Number(amount)) || Number(amount) < 0 || !description.trim()) && styles.updateButtonDisabled]} 
          onPress={updateTransaction}
        >
          <Text style={styles.updateButtonText}>💾 Update Transaction</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => {
            setShowValidationErrors(false);
            setAmountFocused(false);
            setDescriptionFocused(false);
            navigation.goBack();
          }}
        >
          <Text style={styles.cancelButtonText}>❌ Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
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
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e2e8f0',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#1e293b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  inputFocused: {
    borderColor: '#667eea',
    borderWidth: 2,
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  typeButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748b',
  },
  typeButtonTextActive: {
    color: '#ffffff',
  },
  actionContainer: {
    padding: 20,
    paddingBottom: 60,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  updateButton: {
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
  updateButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  updateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  dateButtonIcon: {
    fontSize: 24,
    color: '#667eea',
  },
}); 