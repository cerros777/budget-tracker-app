# Firebase Analytics Setup Guide

This guide explains how to set up Firebase Analytics for the Budget App.

## Prerequisites

- Firebase project created in Firebase Console
- Android device or emulator for testing
- ADB (Android Debug Bridge) installed

## Setup Steps

### 1. Firebase Project Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Add Android app to your project:
   - Package name: `com.tuempresa.tuapp`
   - App nickname: `BudgetApp`
   - Debug signing certificate SHA-1 (optional for development)

### 2. Download Configuration File

1. Download `google-services.json` from Firebase Console
2. Place it in the root directory of your project
3. **Important**: Add `google-services.json` to `.gitignore` to avoid committing sensitive data

### 3. Install Dependencies

The Firebase dependencies are already added to `package.json`:

```json
{
  "@react-native-firebase/app": "^20.8.0",
  "@react-native-firebase/analytics": "^20.8.0"
}
```

### 4. Build Configuration

The app is configured to use Firebase Analytics with:
- Package name: `com.tuempresa.tuapp`
- Google Services file: `./google-services.json`

### 5. Analytics Events

The app tracks the following events:

#### Core Events
- `gasto_agregado` - When user adds an expense
  - Parameters: `monto`, `categoria`, `descripcion`, `fecha`, `currency`
- `ingreso_agregado` - When user adds income
  - Parameters: `monto`, `categoria`, `descripcion`, `fecha`, `currency`
- `ver_resumen` - When user views summary
  - Parameters: `timestamp`
- `editar_gasto` - When user edits an expense
  - Parameters: `gasto_id`, `timestamp`
- `eliminar_gasto` - When user deletes an expense
  - Parameters: `gasto_id`, `timestamp`
- `onboarding_completado` - When user completes onboarding
  - Parameters: `timestamp`

#### Additional Events
- `categoria_creada` - When user creates a category
  - Parameters: `nombre_categoria`, `icono`, `timestamp`
- `meta_establecida` - When user sets a goal
  - Parameters: `monto_meta`, `tipo_meta`, `timestamp`

#### Screen Views
- Automatically tracked via `NavigationTracker` component
- Screen names: `Welcome`, `GoalScreen`, `CategorySetupScreen`, `SuccessScreen`, `Home`, `Category`, `EditTransaction`

### 6. Debug View Setup

To enable Firebase Analytics Debug View:

1. Run the debug command:
   ```bash
   npm run android:debugview
   ```

2. Open Firebase Console > Analytics > DebugView

3. Events will appear in real-time for testing

### 7. Testing Analytics

1. Build and run the app on Android device/emulator
2. Perform actions in the app (add expenses, view summary, etc.)
3. Check Firebase Console > Analytics > Events to see tracked events
4. Use DebugView for real-time testing

### 8. Production Considerations

- Remove debug logging before production release
- Ensure `google-services.json` is properly configured for production
- Test analytics events in production environment
- Monitor Firebase Console for data accuracy

## Troubleshooting

### Common Issues

1. **Analytics not working**: Check if `google-services.json` is in the correct location
2. **Events not appearing**: Verify internet connection and Firebase project configuration
3. **Build errors**: Ensure all dependencies are properly installed

### Debug Commands

```bash
# Enable debug view
npm run android:debugview

# Check if device is connected
adb devices

# View Firebase logs
adb logcat | grep Firebase
```

## File Structure

```
BudgetApp/
├── src/
│   └── analytics/
│       ├── index.ts          # Main analytics module
│       └── NavigationTracker.tsx  # Screen view tracking
├── google-services.json      # Firebase configuration (add to .gitignore)
├── app.json                  # App configuration
└── package.json              # Dependencies
```

## Notes

- Analytics will not break the app if Firebase is not configured
- All analytics calls are wrapped in try-catch blocks
- Screen views are automatically tracked via React Navigation
- Debug mode is enabled for development testing
