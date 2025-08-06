import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Modal } from 'react-native';

const screenWidth = Dimensions.get('window').width;

export default function SpendingChart({ categories, timeFilter, filterTransactionsByTime, onCategoryPress }) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipData, setTooltipData] = useState({ name: '', spending: 0, percentage: 0 });
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  // Calculate spending by category
  const getSpendingData = () => {
    const spendingByCategory = {};
    
    categories.forEach(category => {
      let totalSpending = 0;
      const filteredTransactions = filterTransactionsByTime(category.transactions, timeFilter);
      filteredTransactions.forEach(transaction => {
        if (transaction.type === 'expense') {
          totalSpending += transaction.amount;
        }
      });
      
      // Show all categories, even those with no spending
      spendingByCategory[category.name] = {
        amount: totalSpending,
        icon: category.icon || '📊',
        color: getCategoryColor(category.name),
        id: category.id
      };
    });

    return Object.entries(spendingByCategory)
      .map(([name, data]) => ({
        name: name,
        spending: data.amount,
        color: data.color,
        icon: data.icon,
        id: data.id
      }))
      .sort((a, b) => b.spending - a.spending);
  };

  // Generate colors for categories
  const getCategoryColor = (categoryName) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
    ];
    
    const index = categoryName.length % colors.length;
    return colors[index];
  };

  const chartData = getSpendingData();
  const totalSpending = chartData.reduce((sum, item) => sum + item.spending, 0);

  const showTooltip = (item, percentage, event) => {
    setTooltipData({
      name: item.name,
      spending: item.spending,
      percentage: percentage
    });
    setTooltipVisible(true);
  };

  const hideTooltip = () => {
    setTooltipVisible(false);
  };

  if (categories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyText}>No categories yet</Text>
        <Text style={styles.emptySubtext}>Add some categories to get started</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Spending by Category</Text>
      </View>
      
      {/* Scrollable Bar Chart */}
      <ScrollView 
        style={styles.chartScrollView}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        <View style={styles.chartContainer}>
          {chartData.map((item, index) => {
            const percentage = totalSpending > 0 ? (item.spending / totalSpending) * 100 : 0;
            return (
              <View key={index} style={styles.barItem}>
                <View style={styles.barContent}>
                  <TouchableOpacity
                    onPress={() => onCategoryPress(item.id)}
                    style={styles.iconContainer}
                  >
                    <Text style={styles.barIcon}>{item.icon}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPressIn={() => showTooltip(item, percentage)}
                    onPressOut={hideTooltip}
                    style={styles.barWrapper}
                  >
                    <View style={styles.barHeader}>
                      <Text style={styles.barAmount}>${item.spending.toFixed(2)}</Text>
                      <Text style={styles.barPercentage}>{percentage.toFixed(1)}%</Text>
                    </View>
                    <View style={styles.barContainer}>
                      <View 
                        style={[
                          styles.bar, 
                          { 
                            width: `${percentage}%`,
                            backgroundColor: item.color
                          }
                        ]} 
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
      
      {/* Tooltip Modal */}
      <Modal
        visible={tooltipVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={hideTooltip}
      >
        <View style={styles.tooltipOverlay}>
          <View style={styles.tooltipContainer}>
            <Text style={styles.tooltipTitle}>{tooltipData.name}</Text>
            <Text style={styles.tooltipAmount}>${tooltipData.spending.toFixed(2)}</Text>
            <Text style={styles.tooltipPercentage}>{tooltipData.percentage.toFixed(1)}% of total</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    flex: 1,
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  emptyContainer: {
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
  chartScrollView: {
    flex: 1,
  },
  chartContainer: {
    marginTop: 10,
    paddingBottom: 20, // Add bottom spacing
  },
  barItem: {
    marginBottom: 15,
    paddingVertical: 5,
  },
  barContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 10,
  },
  barWrapper: {
    flex: 1,
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  barIcon: {
    fontSize: 28, // Increased icon size
  },
  barAmount: {
    fontSize: 16, // Increased font size
    fontWeight: '600',
    color: '#64748b',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28, // Increased from 20 to 28 to accommodate larger bars
  },
  bar: {
    height: 25, // Increased from 12 to 20
    borderRadius: 5, // Increased from 6 to 10 to match new height
    marginRight: 10,
    minWidth: 1,
  },
  barPercentage: {
    fontSize: 14, // Increased font size
    color: '#64748b',
    fontWeight: '500',
    minWidth: 35,
  },
  tooltipOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  tooltipContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    width: screenWidth * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  tooltipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  tooltipAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 5,
  },
  tooltipPercentage: {
    fontSize: 14,
    color: '#64748b',
  },
}); 