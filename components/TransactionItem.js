import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';

export default function TransactionItem({ transaction, onDelete, onEdit }) {
  // Get transaction icon based on type
  const getTransactionIcon = (type) => {
    return type === 'income' ? '💰' : '💸';
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    
    // Parse the date string (YYYY-MM-DD) correctly
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const handleDelete = () => {
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    onDelete(transaction.id);
    setIsDeleteModalVisible(false);
  };

  const cancelDelete = () => {
    setIsDeleteModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.transactionCard}>
        <View style={styles.iconContainer}>
          <Text style={styles.transactionIcon}>{getTransactionIcon(transaction.type)}</Text>
        </View>
        
        <View style={styles.transactionInfo}>
          <Text style={styles.description} numberOfLines={2}>
            {transaction.description || 'No description'}
          </Text>
          <Text style={styles.date}>{formatDate(transaction.date)}</Text>
        </View>
        
        <View style={styles.amountContainer}>
          <Text style={[
            styles.amount,
            transaction.type === 'income' ? styles.incomeAmount : styles.expenseAmount
          ]}>
            {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => onEdit(transaction)}
          >
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={handleDelete}
          >
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={isDeleteModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteConfirmationContent}>
            <View style={styles.deleteConfirmationIcon}>
              <Text style={styles.deleteConfirmationIconText}>⚠️</Text>
            </View>
            
            <Text style={styles.deleteConfirmationTitle}>Delete Transaction</Text>
            <Text style={styles.deleteConfirmationMessage}>
              Are you sure you want to delete "{transaction.description}" ({"$" + transaction.amount.toFixed(2)})?
            </Text>
            
            <View style={styles.deleteConfirmationActions}>
              <TouchableOpacity 
                style={styles.deleteConfirmationCancelButton}
                onPress={cancelDelete}
              >
                <Text style={styles.deleteConfirmationCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteConfirmationDeleteButton}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteConfirmationDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  transactionIcon: {
    fontSize: 20,
  },
  transactionInfo: {
    flex: 1,
    marginRight: 12,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  amountContainer: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  incomeAmount: {
    color: '#16a34a',
  },
  expenseAmount: {
    color: '#dc2626',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  editIcon: {
    fontSize: 14,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteIcon: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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