import analytics from '@react-native-firebase/analytics';

/**
 * Firebase Analytics Module for Budget App
 * 
 * This module provides a centralized way to track user events in the budget app.
 * It includes functions for tracking spending events, screen views, and user interactions.
 * 
 * Debug View Setup:
 * 1. Run: npm run android:debugview
 * 2. Open Firebase Console > Analytics > DebugView
 * 3. Events will appear in real-time for testing
 */

// Initialize analytics with debug mode for development
const initializeAnalytics = async () => {
  try {
    // Enable analytics collection
    await analytics().setAnalyticsCollectionEnabled(true);
    
    // Set user properties for better segmentation
    await analytics().setUserProperty('app_version', '1.0.0');
    await analytics().setUserProperty('platform', 'android');
    
    console.log('Firebase Analytics initialized successfully');
  } catch (error) {
    console.warn('Firebase Analytics initialization failed:', error);
    // Don't break the app if Firebase is not configured
  }
};

// Track screen views for React Navigation
export const trackScreenView = async (screenName, screenClass) => {
  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
    console.log(`Screen view tracked: ${screenName}`);
  } catch (error) {
    console.warn('Failed to track screen view:', error);
  }
};

// Track when a new expense is added
export const trackExpenseAdded = async (params) => {
  try {
    await analytics().logEvent('gasto_agregado', {
      monto: params.amount,
      categoria: params.category,
      descripcion: params.description || '',
      fecha: params.date || new Date().toISOString(),
      currency: 'USD', // Default currency
    });
    console.log('Expense added event tracked:', params);
  } catch (error) {
    console.warn('Failed to track expense added:', error);
  }
};

// Track when user views summary
export const trackSummaryViewed = async () => {
  try {
    await analytics().logEvent('ver_resumen', {
      timestamp: new Date().toISOString(),
    });
    console.log('Summary viewed event tracked');
  } catch (error) {
    console.warn('Failed to track summary viewed:', error);
  }
};

// Track when user edits an expense
export const trackExpenseEdited = async (expenseId) => {
  try {
    await analytics().logEvent('editar_gasto', {
      gasto_id: expenseId,
      timestamp: new Date().toISOString(),
    });
    console.log('Expense edited event tracked:', expenseId);
  } catch (error) {
    console.warn('Failed to track expense edited:', error);
  }
};

// Track when user deletes an expense
export const trackExpenseDeleted = async (expenseId) => {
  try {
    await analytics().logEvent('eliminar_gasto', {
      gasto_id: expenseId,
      timestamp: new Date().toISOString(),
    });
    console.log('Expense deleted event tracked:', expenseId);
  } catch (error) {
    console.warn('Failed to track expense deleted:', error);
  }
};

// Track when onboarding is completed
export const trackOnboardingCompleted = async () => {
  try {
    await analytics().logEvent('onboarding_completado', {
      timestamp: new Date().toISOString(),
    });
    console.log('Onboarding completed event tracked');
  } catch (error) {
    console.warn('Failed to track onboarding completed:', error);
  }
};

// Track income added
export const trackIncomeAdded = async (params) => {
  try {
    await analytics().logEvent('ingreso_agregado', {
      monto: params.amount,
      categoria: params.category,
      descripcion: params.description || '',
      fecha: params.date || new Date().toISOString(),
      currency: 'USD',
    });
    console.log('Income added event tracked:', params);
  } catch (error) {
    console.warn('Failed to track income added:', error);
  }
};

// Track category creation
export const trackCategoryCreated = async (categoryName, icon) => {
  try {
    await analytics().logEvent('categoria_creada', {
      nombre_categoria: categoryName,
      icono: icon || '',
      timestamp: new Date().toISOString(),
    });
    console.log('Category created event tracked:', categoryName);
  } catch (error) {
    console.warn('Failed to track category created:', error);
  }
};

// Track goal setting
export const trackGoalSet = async (goalAmount, goalType) => {
  try {
    await analytics().logEvent('meta_establecida', {
      monto_meta: goalAmount,
      tipo_meta: goalType,
      timestamp: new Date().toISOString(),
    });
    console.log('Goal set event tracked:', { goalAmount, goalType });
  } catch (error) {
    console.warn('Failed to track goal set:', error);
  }
};

// Initialize analytics when module is imported
initializeAnalytics();

export default {
  trackScreenView,
  trackExpenseAdded,
  trackSummaryViewed,
  trackExpenseEdited,
  trackExpenseDeleted,
  trackOnboardingCompleted,
  trackIncomeAdded,
  trackCategoryCreated,
  trackGoalSet,
};
