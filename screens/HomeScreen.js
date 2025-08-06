import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ScrollView, Animated, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SpendingChart from '../components/SpendingChart';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [balanceAnimation] = useState(new Animated.Value(1));
  const [incomeAnimation] = useState(new Animated.Value(1));
  const [expenseAnimation] = useState(new Animated.Value(1));
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [selectedToggle, setSelectedToggle] = useState('income'); // 'income' or 'expense'
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('month'); // 'month', 'week', 'today', 'all'
  const [showTimeFilterModal, setShowTimeFilterModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadCategories = async () => {
        const data = await AsyncStorage.getItem('categories');
        if (data) setCategories(JSON.parse(data));
      };
      loadCategories();
    }, [])
  );

  useEffect(() => {
    AsyncStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  // Calculate totals from all categories
  const calculateTotals = () => {
    let totalIncome = 0;
    let totalExpenses = 0;

    categories.forEach(category => {
      const filteredTransactions = filterTransactionsByTime(category.transactions, selectedTimeFilter);
      filteredTransactions.forEach(transaction => {
        if (transaction.type === 'income') {
          totalIncome += transaction.amount;
        } else {
          totalExpenses += transaction.amount;
        }
      });
    });

    return {
      income: totalIncome,
      expenses: totalExpenses,
      balance: totalIncome - totalExpenses
    };
  };

  // Format number with commas
  const formatNumber = (num) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Filter transactions by time period
  const filterTransactionsByTime = (transactions, timeFilter) => {
    // Helper function to get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    // Helper function to get date string from YYYY-MM-DD
    const getDateString = (dateString) => {
      if (!dateString) return '';
      return dateString.split('T')[0]; // Remove time part if present
    };
    
    const todayString = getTodayDate();
    
    return transactions.filter(transaction => {
      const transactionDateString = getDateString(transaction.date);
      
      switch (timeFilter) {
        case 'today':
          return transactionDateString === todayString;
        case 'week':
          // Get date 7 days ago
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          const weekAgoString = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, '0')}-${String(weekAgo.getDate()).padStart(2, '0')}`;
          return transactionDateString >= weekAgoString && transactionDateString <= todayString;
        case 'month':
          // Get first day of current month
          const firstDayOfMonth = new Date();
          firstDayOfMonth.setDate(1);
          const firstDayString = `${firstDayOfMonth.getFullYear()}-${String(firstDayOfMonth.getMonth() + 1).padStart(2, '0')}-${String(firstDayOfMonth.getDate()).padStart(2, '0')}`;
          return transactionDateString >= firstDayString && transactionDateString <= todayString;
        case 'all':
        default:
          return true;
      }
    });
  };

  // Animate number updates
  const animateNumber = (animationValue) => {
    Animated.sequence([
      Animated.timing(animationValue, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Animate when totals change
  useEffect(() => {
    animateNumber(balanceAnimation);
    animateNumber(incomeAnimation);
    animateNumber(expenseAnimation);
  }, [totals, selectedTimeFilter]);

  // Replace the addCategory function with an async version that always fetches the latest categories from AsyncStorage
  const addCategory = async () => {
    if (!newCategory.trim()) return;
    const data = await AsyncStorage.getItem('categories');
    const currentCategories = data ? JSON.parse(data) : [];
    const newCat = {
      id: Date.now().toString(),
      name: newCategory.trim(),
      transactions: [],
    };
    const updatedCategories = [...currentCategories, newCat];
    setCategories(updatedCategories);
    setNewCategory('');
    setShowAddCategoryModal(false);
  };

  // Temporary function to reset onboarding (remove this in production)
  const resetOnboarding = async () => {
    await AsyncStorage.removeItem('onboardingComplete');
    // Force app restart by clearing all data
    await AsyncStorage.clear();
    // You'll need to restart the app manually
    alert('Onboarding reset! Please restart the app to see the onboarding flow again.');
  };

  const totals = calculateTotals();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💰 Budget Tracker</Text>
        <Text style={styles.headerSubtitle}>Manage your finances</Text>
        {/* Temporary reset button - remove in production */}
        <TouchableOpacity 
          style={styles.resetButton} 
          onPress={resetOnboarding}
        >
          <Text style={styles.resetButtonText}>🔄 Reset Onboarding</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        {/* Compact Financial Summary - Fixed */}
        <View style={styles.compactSummary}>
          {/* Total Balance on Top */}
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total</Text>
            <View style={styles.totalAmountContainer}>
              <Animated.Text 
                style={[
                  styles.totalSign, 
                  totals.balance >= 0 ? styles.positiveSign : styles.negativeSign,
                  { transform: [{ scale: balanceAnimation }] }
                ]}
              >
                {totals.balance >= 0 ? '+' : '-'}
              </Animated.Text>
              <Animated.Text 
                style={[
                  styles.totalCurrency, 
                  totals.balance >= 0 ? styles.positiveSign : styles.negativeSign,
                  { transform: [{ scale: balanceAnimation }] }
                ]}
              >
                $
              </Animated.Text>
              <Animated.Text 
                style={[
                  styles.totalAmount, 
                  totals.balance >= 0 ? styles.positiveSign : styles.negativeSign,
                  { transform: [{ scale: balanceAnimation }] }
                ]}
              >
                {formatNumber(Math.abs(totals.balance))}
              </Animated.Text>
            </View>
          </View>
          
          {/* Income and Expenses Below */}
          <View style={styles.incomeExpenseRow}>
            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                style={[
                  styles.toggleButton,
                  selectedToggle === 'income' ? styles.incomeSelected : styles.incomeUnselected
                ]}
                onPress={() => setSelectedToggle('income')}
              >
                <Animated.Text 
                  style={[
                    styles.summaryAmount, 
                    selectedToggle === 'income' ? styles.incomeSelectedText : styles.incomeUnselectedText,
                    { transform: [{ scale: incomeAnimation }] }
                  ]}
                >
                  +${formatNumber(totals.income)}
                </Animated.Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.toggleButton,
                  selectedToggle === 'expense' ? styles.expenseSelected : styles.expenseUnselected
                ]}
                onPress={() => setSelectedToggle('expense')}
              >
                <Animated.Text 
                  style={[
                    styles.summaryAmount, 
                    selectedToggle === 'expense' ? styles.expenseSelectedText : styles.expenseUnselectedText,
                    { transform: [{ scale: expenseAnimation }] }
                  ]}
                >
                  -${formatNumber(totals.expenses)}
                </Animated.Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Time Filter */}
          <View style={styles.timeFilterContainer}>
            <TouchableOpacity 
              style={styles.timeFilterDropdown}
              onPress={() => setShowTimeFilterModal(true)}
            >
              <Text style={styles.timeFilterText}>{selectedTimeFilter.charAt(0).toUpperCase() + selectedTimeFilter.slice(1)}</Text>
              <Text style={styles.timeFilterIcon}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chart Section - Scrollable */}
        <View style={styles.chartSection}>
          <SpendingChart 
            categories={categories} 
            timeFilter={selectedTimeFilter}
            filterTransactionsByTime={filterTransactionsByTime}
            onCategoryPress={(categoryId) => {
              const category = categories.find(cat => cat.id === categoryId);
              if (category) {
                navigation.navigate('Category', { 
                  categoryId: category.id, 
                  categoryName: category.name 
                });
              }
            }}
          />
        </View>
      </View>

      {/* Add Category Section */}
      <View style={styles.addSection}>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setShowAddCategoryModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add Category</Text>
        </TouchableOpacity>
      </View>

      {/* Add Category Modal */}
      <Modal
        visible={showAddCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Category</Text>
              <TouchableOpacity onPress={() => setShowAddCategoryModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Enter category name..."
              placeholderTextColor="#9ca3af"
              value={newCategory}
              onChangeText={setNewCategory}
            />
            
            <View style={styles.modalActionContainer}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowAddCategoryModal(false);
                  setNewCategory('');
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalConfirmButton, !newCategory.trim() && styles.modalConfirmButtonDisabled]} 
                onPress={addCategory}
                disabled={!newCategory.trim()}
              >
                <Text style={styles.modalConfirmButtonText}>Add Category</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Time Filter Modal */}
      <Modal
        visible={showTimeFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTimeFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timeFilterModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time Period</Text>
              <TouchableOpacity onPress={() => setShowTimeFilterModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.timeFilterOption,
                selectedTimeFilter === 'month' && styles.timeFilterOptionSelected
              ]}
              onPress={() => {
                setSelectedTimeFilter('month');
                setShowTimeFilterModal(false);
              }}
            >
              <Text style={[
                styles.timeFilterOptionText,
                selectedTimeFilter === 'month' && styles.timeFilterOptionSelectedText
              ]}>Month</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.timeFilterOption,
                selectedTimeFilter === 'week' && styles.timeFilterOptionSelected
              ]}
              onPress={() => {
                setSelectedTimeFilter('week');
                setShowTimeFilterModal(false);
              }}
            >
              <Text style={[
                styles.timeFilterOptionText,
                selectedTimeFilter === 'week' && styles.timeFilterOptionSelectedText
              ]}>Week</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.timeFilterOption,
                selectedTimeFilter === 'today' && styles.timeFilterOptionSelected
              ]}
              onPress={() => {
                setSelectedTimeFilter('today');
                setShowTimeFilterModal(false);
              }}
            >
              <Text style={[
                styles.timeFilterOptionText,
                selectedTimeFilter === 'today' && styles.timeFilterOptionSelectedText
              ]}>Today</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.timeFilterOption,
                selectedTimeFilter === 'all' && styles.timeFilterOptionSelected
              ]}
              onPress={() => {
                setSelectedTimeFilter('all');
                setShowTimeFilterModal(false);
              }}
            >
              <Text style={[
                styles.timeFilterOptionText,
                selectedTimeFilter === 'all' && styles.timeFilterOptionSelectedText
              ]}>All</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#dc2626',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 10,
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  compactSummary: {
    backgroundColor: '#ffffff',
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  totalSection: {
    alignItems: 'center',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 5,
    fontWeight: '500',
  },
  totalAmountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  totalSign: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 2,
  },
  totalCurrency: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 2,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: '900',
  },
  incomeExpenseRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 2,
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  summaryAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  positiveBalance: {
    color: '#15803d', // Darker green for balance
    fontSize: 42, // Larger font for balance
    fontWeight: '700', // Extra bold for balance
  },
  negativeBalance: {
    color: '#b91c1c', // Darker red for balance
    fontSize: 42, // Larger font for balance
    fontWeight: '700', // Extra bold for balance
  },
  positiveSign: {
    color: '#15803d', // Darker green for positive sign
  },
  negativeSign: {
    color: '#b91c1c', // Darker red for negative sign
  },
  chartSection: {
    flex: 1,
    marginTop: 20,
  },
  addSection: {
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
  input: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: '#f8fafc',
    marginBottom: 15,
    color: '#1e293b',
  },
  addButton: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 25,
    width: '80%',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    fontSize: 24,
    color: '#64748b',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: '#f8fafc',
    color: '#1e293b',
    width: '100%',
    marginBottom: 20,
  },
  modalActionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalCancelButton: {
    backgroundColor: '#dc2626',
    padding: 15,
    borderRadius: 12,
    width: '40%',
  },
  modalCancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalConfirmButton: {
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 12,
    width: '40%',
  },
  modalConfirmButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  modalConfirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  incomeSelected: {
    backgroundColor: '#16a34a',
    borderRadius: 10,
  },
  incomeUnselected: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },
  incomeSelectedText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  incomeUnselectedText: {
    color: '#1e293b',
    fontWeight: '600',
  },
  expenseSelected: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
  },
  expenseUnselected: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },
  expenseSelectedText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  expenseUnselectedText: {
    color: '#1e293b',
    fontWeight: '600',
  },
  timeFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    paddingVertical: 8,
  },
  timeFilterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  timeFilterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    marginRight: 5,
  },
  timeFilterIcon: {
    fontSize: 14,
    color: '#64748b',
  },
  timeFilterSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  timeFilterSelectedText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  timeFilterModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 25,
    width: '80%',
    alignItems: 'center',
  },
  timeFilterOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
  },
  timeFilterOptionSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  timeFilterOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  timeFilterOptionSelectedText: {
    color: '#ffffff',
    fontWeight: '600',
  },
}); 