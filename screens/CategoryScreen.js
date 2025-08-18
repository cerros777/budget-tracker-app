import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, StatusBar, Modal, Alert, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TransactionItem from '../components/TransactionItem';
import { useFocusEffect } from '@react-navigation/native';
import { trackExpenseAdded, trackExpenseDeleted } from '../src/analytics/index.js';

export default function CategoryScreen({ route, navigation }) {
  const { categoryId, categoryName } = route.params;
  
  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [categories, setCategories] = useState([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('expense');
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [transactions, setTransactions] = useState([]);
  const [showIconModal, setShowIconModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [newIcon, setNewIcon] = useState('');
  const [amountFocused, setAmountFocused] = useState(false);
  const [descriptionFocused, setDescriptionFocused] = useState(false);
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [iconAnimation] = useState(new Animated.Value(1));
  const [borderAnimation] = useState(new Animated.Value(0));

  // Available icons for selection
  const availableIcons = [
    '🍕', '🚗', '🎬', '🛍️', '🏥', '📚', '💰', '💼', '📈', '🎁', '🏠', '📄', 
    '⛽', '☕', '💪', '📊', '🍔', '🎮', '✈️', '🏦', '💳', '🎵', '🎨'
  ];

  const loadCategories = async () => {
    const data = await AsyncStorage.getItem('categories');
    if (data) {
      const cats = JSON.parse(data);
      setCategories(cats);
      const cat = cats.find(c => c.id === categoryId);
      setTransactions(cat ? cat.transactions : []);
      setCurrentCategory(cat);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
    loadCategories();
    }, [categoryId])
  );

  const addTransaction = async () => {
    if (!amount.trim() || isNaN(Number(amount)) || Number(amount) < 0 || !description.trim()) {
      setShowValidationErrors(true);
      return;
    }
    setShowValidationErrors(false);
    const newTxn = {
      id: Date.now().toString(),
      amount: parseFloat(amount),
      description: description.trim(),
      date: selectedDate,
      type,
    };
    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, transactions: [...cat.transactions, newTxn] };
      }
      return cat;
    });
    setCategories(updatedCategories);
    setTransactions([...transactions, newTxn]);
    
    // Track analytics event
    await trackExpenseAdded({
      amount: parseFloat(amount),
      category: categoryName,
      description: description.trim(),
      date: selectedDate,
    });
    
    setAmount('');
    setDescription('');
    setSelectedDate(getTodayDate());
    setShowAddModal(false);
    await AsyncStorage.setItem('categories', JSON.stringify(updatedCategories));
  };

  // Add a handler to delete a transaction
  const deleteTransaction = async (transactionId) => {
    const updatedTransactions = transactions.filter(txn => txn.id !== transactionId);
    setTransactions(updatedTransactions);
    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, transactions: updatedTransactions };
      }
      return cat;
    });
    setCategories(updatedCategories);
    
    // Track analytics event
    await trackExpenseDeleted(transactionId);
    
    await AsyncStorage.setItem('categories', JSON.stringify(updatedCategories));
  };

  // Add a handler to edit a transaction
  const editTransaction = (transaction) => {
    navigation.navigate('EditTransaction', { transaction, categoryId });
  };

  // Add a handler to delete the category
  const deleteCategory = async () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteCategory = async () => {
    const updatedCategories = categories.filter(cat => cat.id !== categoryId);
    setCategories(updatedCategories);
    await AsyncStorage.setItem('categories', JSON.stringify(updatedCategories));
    setShowDeleteConfirmation(false);
    navigation.goBack();
  };

  // Update category icon
  const updateCategoryIcon = async (newIcon) => {
    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return { ...cat, icon: newIcon };
      }
      return cat;
    });
    setCategories(updatedCategories);
    setCurrentCategory({ ...currentCategory, icon: newIcon });
    setShowIconModal(false);
    await AsyncStorage.setItem('categories', JSON.stringify(updatedCategories));
  };

  // Animate icon when pressed
  const animateIcon = () => {
    Animated.sequence([
      Animated.timing(iconAnimation, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(iconAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleIconPress = () => {
    animateIcon();
    setShowIconModal(true);
  };

  // Start pulsing border effect when component mounts
  useEffect(() => {
    const startPulsing = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(borderAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(borderAnimation, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };
    
    startPulsing();
  }, []);


  // Calculate category totals
  const calculateCategoryTotals = () => {
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        totalIncome += transaction.amount;
      } else {
        totalExpenses += transaction.amount;
      }
    });

    return {
      income: totalIncome,
      expenses: totalExpenses,
      balance: totalIncome - totalExpenses
    };
  };

  const totals = calculateCategoryTotals();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerTopRow}>
            <Animated.View style={[
              styles.iconButton,
              {
                borderColor: borderAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['#667eea', 'rgba(255, 255, 255, 0.8)']
                }),
                borderWidth: borderAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [2, 3]
                })
              }
            ]}>
              <TouchableOpacity 
                style={styles.iconTouchable} 
                onPress={handleIconPress}
                activeOpacity={0.7}
              >
                <Animated.Text style={[styles.categoryIcon, { transform: [{ scale: iconAnimation }] }]}>
                  {currentCategory?.icon || '📊'}
                </Animated.Text>
              </TouchableOpacity>
            </Animated.View>
            
            {/* Tooltip */}
            {/* Removed as per edit hint */}
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>{categoryName}</Text>
              <Text style={styles.headerSubtitle}>{transactions.length} transactions</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={deleteCategory}>
          <Text style={styles.deleteButtonText}>Delete Category</Text>
        </TouchableOpacity>
      </View>

      {/* Category Summary */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, styles.incomeIcon]}>
              <Text style={styles.iconText}>📈</Text>
            </View>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={[styles.summaryAmount, styles.incomeText]}>+${totals.income.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, styles.expenseIcon]}>
              <Text style={styles.iconText}>📉</Text>
            </View>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={[styles.summaryAmount, styles.expenseText]}>-${totals.expenses.toFixed(2)}</Text>
          </View>
        </View>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Net Balance</Text>
          <Text style={[
            styles.balanceAmount, 
            totals.balance >= 0 ? styles.positiveBalance : styles.negativeBalance
          ]}>
            {totals.balance >= 0 ? '+' : ''}${totals.balance.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Transactions List */}
      <View style={styles.transactionsSection}>
        <Text style={styles.sectionTitle}>💳 Transactions</Text>
      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
          renderItem={({ item }) => <TransactionItem transaction={item} onDelete={deleteTransaction} onEdit={editTransaction} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💳</Text>
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>Add your first transaction below!</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Add Transaction Section */}
      <View style={styles.addSection}>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add Transaction</Text>
        </TouchableOpacity>
      </View>

      {/* Icon Selection Modal */}
      <Modal
        visible={showIconModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowIconModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Icon</Text>
              <TouchableOpacity onPress={() => setShowIconModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.iconGrid}>
              {availableIcons.map((icon, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.iconOption}
                  onPress={() => updateCategoryIcon(icon)}
                >
                  <Text style={styles.iconOptionText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Transaction Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowAddModal(false);
          setAmount('');
          setDescription('');
          setSelectedDate(getTodayDate());
          setShowValidationErrors(false);
          setAmountFocused(false);
          setDescriptionFocused(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Transaction</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
      <TextInput
              style={[
                styles.modalInput,
                amountFocused && styles.modalInputFocused,
                showValidationErrors && (!amount.trim() || isNaN(Number(amount)) || Number(amount) < 0) && styles.modalInputError
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
            
      <TextInput
              style={[
                styles.modalInput,
                descriptionFocused && styles.modalInputFocused,
                showValidationErrors && !description.trim() && styles.modalInputError
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
            
            {/* Date Selection */}
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Date</Text>
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
            
            <View style={styles.modalTypeContainer}>
        <TouchableOpacity
                style={[
                  styles.modalTypeButton,
                  type === 'expense' && styles.modalTypeButtonActive
                ]}
          onPress={() => setType('expense')}
        >
                <Text style={[styles.modalTypeButtonText, type === 'expense' && styles.modalTypeButtonTextActive]}>
                  💸 Expense
                </Text>
        </TouchableOpacity>
        <TouchableOpacity
                style={[
                  styles.modalTypeButton,
                  type === 'income' && styles.modalTypeButtonActive
                ]}
          onPress={() => setType('income')}
        >
                <Text style={[styles.modalTypeButtonText, type === 'income' && styles.modalTypeButtonTextActive]}>
                  💰 Income
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalActionContainer}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowAddModal(false);
                  setAmount('');
                  setDescription('');
                  setSelectedDate(getTodayDate());
                  setShowValidationErrors(false);
                  setAmountFocused(false);
                  setDescriptionFocused(false);
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalConfirmButton, (!amount.trim() || isNaN(Number(amount)) || Number(amount) < 0 || !description.trim()) && styles.modalConfirmButtonDisabled]} 
                onPress={addTransaction}
              >
                <Text style={styles.modalConfirmButtonText}>Add Transaction</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Category Confirmation Modal */}
      <Modal
        visible={showDeleteConfirmation}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirmation(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteConfirmationContent}>
            <View style={styles.deleteConfirmationIcon}>
              <Text style={styles.deleteConfirmationIconText}>⚠️</Text>
            </View>
            
            <Text style={styles.deleteConfirmationTitle}>Delete Category</Text>
            <Text style={styles.deleteConfirmationMessage}>
              Are you sure you want to delete "{categoryName}"? This will also delete all {currentCategory?.transactions?.length || 0} transactions in this category.
            </Text>
            
            <View style={styles.deleteConfirmationActions}>
              <TouchableOpacity 
                style={styles.deleteConfirmationCancelButton}
                onPress={() => setShowDeleteConfirmation(false)}
              >
                <Text style={styles.deleteConfirmationCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteConfirmationDeleteButton}
                onPress={confirmDeleteCategory}
              >
                <Text style={styles.deleteConfirmationDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
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
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 24,
  },
  headerTextContainer: {
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

  deleteButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  summaryContainer: {
    backgroundColor: '#ffffff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  incomeIcon: {
    backgroundColor: '#dcfce7',
  },
  expenseIcon: {
    backgroundColor: '#fee2e2',
  },
  iconText: {
    fontSize: 20,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 5,
    fontWeight: '500',
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  incomeText: {
    color: '#16a34a',
  },
  expenseText: {
    color: '#dc2626',
  },
  balanceContainer: {
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  positiveBalance: {
    color: '#16a34a',
  },
  negativeBalance: {
    color: '#dc2626',
  },
  transactionsSection: {
    flex: 1,
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
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
  addSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
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
  typeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  typeButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  typeButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748b',
  },
  typeButtonTextActive: {
    color: '#ffffff',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    fontSize: 24,
    color: '#64748b',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  iconOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  iconOptionText: {
    fontSize: 24,
  },
  modalInput: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: '#f8fafc',
    marginBottom: 15,
    color: '#1e293b',
    width: '100%',
  },
  modalInputFocused: {
    borderColor: '#667eea',
    borderWidth: 2,
  },
  modalInputError: {
    borderColor: '#dc2626',
    borderWidth: 2,
  },
  modalTypeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
    width: '100%',
  },
  modalTypeButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  modalTypeButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  modalTypeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748b',
  },
  modalTypeButtonTextActive: {
    color: '#ffffff',
  },
  modalActionContainer: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748b',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#667eea',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalConfirmButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  modalConfirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateContainer: {
    width: '100%',
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
  },
  dateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  dateButtonIcon: {
    fontSize: 20,
  },
  deleteConfirmationContent: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  deleteConfirmationIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  deleteConfirmationIconText: {
    fontSize: 30,
  },
  deleteConfirmationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
  },
  deleteConfirmationMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  deleteConfirmationActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  deleteConfirmationCancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  deleteConfirmationCancelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#64748b',
  },
  deleteConfirmationDeleteButton: {
    flex: 1,
    backgroundColor: '#dc2626',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteConfirmationDeleteText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 