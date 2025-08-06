import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function CategoryItem({ category, onPress }) {
  // Calculate total for this category
  const calculateCategoryTotal = () => {
    let total = 0;
    category.transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        total += transaction.amount;
      } else {
        total -= transaction.amount;
      }
    });
    return total;
  };

  // Format number with commas
  const formatNumber = (num) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Get category icon based on name or custom icon
  const getCategoryIcon = (name, customIcon) => {
    if (customIcon) return customIcon;
    
    const lowerName = name.toLowerCase();
    if (lowerName.includes('food') || lowerName.includes('comida')) return '🍕';
    if (lowerName.includes('transport') || lowerName.includes('transporte')) return '🚗';
    if (lowerName.includes('entertainment') || lowerName.includes('entretenimiento')) return '🎬';
    if (lowerName.includes('shopping') || lowerName.includes('compras')) return '🛍️';
    if (lowerName.includes('health') || lowerName.includes('salud')) return '🏥';
    if (lowerName.includes('education') || lowerName.includes('educacion')) return '📚';
    if (lowerName.includes('salary') || lowerName.includes('salario')) return '💰';
    if (lowerName.includes('freelance') || lowerName.includes('freelance')) return '💼';
    if (lowerName.includes('investment') || lowerName.includes('inversion')) return '📈';
    if (lowerName.includes('gift') || lowerName.includes('regalo')) return '🎁';
    if (lowerName.includes('home') || lowerName.includes('casa')) return '🏠';
    if (lowerName.includes('bills') || lowerName.includes('facturas')) return '📄';
    if (lowerName.includes('gas') || lowerName.includes('gasolina')) return '⛽';
    if (lowerName.includes('coffee') || lowerName.includes('cafe')) return '☕';
    if (lowerName.includes('gym') || lowerName.includes('ejercicio')) return '💪';
    return '📊'; // More meaningful default icon
  };

  const total = calculateCategoryTotal();
  const icon = getCategoryIcon(category.name, category.icon);

  return (
    <TouchableOpacity style={styles.categoryCard} onPress={() => onPress(category)}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.categoryName} numberOfLines={1}>
        {category.name}
      </Text>
      {total !== 0 && (
        <Text style={[
          styles.categoryTotal,
          total > 0 ? styles.positiveTotal : styles.negativeTotal
        ]}>
          {total > 0 ? '+' : ''}${formatNumber(Math.abs(total))}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  categoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8, // Reduced from 12 to 8
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'space-between',
    width: '30%', // Fixed width for 3 columns with spacing
    marginHorizontal: '1.66%', // Small margin between cards
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 6,
    flex: 1,
  },
  categoryTotal: {
    fontSize: 14,
    fontWeight: '600', // Same weight as income/expenses
    textAlign: 'center',
    color: '#6b7280', // Light gray for negative values (default)
  },
  positiveTotal: {
    color: '#10b981', // Much nicer emerald green
  },
  negativeTotal: {
    color: '#6b7280', // Light gray for negative values
  },
}); 