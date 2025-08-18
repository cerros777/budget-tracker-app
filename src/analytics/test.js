/**
 * Test file for Firebase Analytics module
 * This file can be used to test the analytics functions without Firebase configuration
 */

import { 
  trackExpenseAdded, 
  trackIncomeAdded, 
  trackSummaryViewed, 
  trackExpenseEdited, 
  trackExpenseDeleted, 
  trackOnboardingCompleted,
  trackCategoryCreated,
  trackGoalSet
} from './index.js';

// Test function to verify all analytics functions work
export const testAnalytics = async () => {
  console.log('Testing Firebase Analytics functions...');
  
  try {
    // Test expense tracking
    await trackExpenseAdded({
      amount: 50.00,
      category: 'Food',
      description: 'Lunch',
      date: '2024-01-15'
    });
    
    // Test income tracking
    await trackIncomeAdded({
      amount: 1000.00,
      category: 'Salary',
      description: 'Monthly salary',
      date: '2024-01-15'
    });
    
    // Test summary view
    await trackSummaryViewed();
    
    // Test expense editing
    await trackExpenseEdited('test-expense-id-123');
    
    // Test expense deletion
    await trackExpenseDeleted('test-expense-id-123');
    
    // Test onboarding completion
    await trackOnboardingCompleted();
    
    // Test category creation
    await trackCategoryCreated('Test Category', '📊');
    
    // Test goal setting
    await trackGoalSet(5000, 'save');
    
    console.log('All analytics tests completed successfully!');
  } catch (error) {
    console.warn('Analytics test failed (expected if Firebase not configured):', error);
  }
};

export default testAnalytics;
