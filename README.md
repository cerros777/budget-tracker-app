# Budget Tracker App

A modern, intuitive budget tracking application built with React Native.

## Features

- 💰 **Financial Summary**: Track income, expenses, and balance
- �� **Visual Charts**: Spending breakdown by category
- 🗂️ **Category Management**: Custom categories with icons
- �� **Date Tracking**: Transaction history with date filtering
- 🎯 **Time Filters**: View data by day, week, month, or all time
- 🛡️ **Data Safety**: Confirmation dialogs for deletions
- 📱 **Modern UI**: Clean, intuitive interface

## Screenshots



## Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/budget-tracker-app.git

# Install dependencies
npm install

# Run on iOS
npx react-native run-ios

# Run on Android
npx react-native run-android
```

## Tech Stack

- React Native
- Expo
- AsyncStorage
- React Navigation
- Firebase Analytics (Android only)

## Firebase Analytics

This app includes Firebase Analytics integration for tracking user behavior and app usage. See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed setup instructions.

### Quick Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Add Android app with package name: `com.tuempresa.tuapp`
3. Download `google-services.json` and place in project root
4. Run `npm run android:debugview` to enable debug mode

### Analytics Events

The app tracks the following events:
- Expense/Income additions
- Transaction editing/deletion
- Screen views
- Onboarding completion
- Category creation
- Goal setting

## Development

This is an MVP version. Future features planned:
- Cloud sync
- Export functionality
- Budget goals
- Receipt photos
