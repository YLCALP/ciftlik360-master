# Çiftlik365 Theme System

A comprehensive design system for consistent UI across the Çiftlik365 mobile app. This theme system provides standardized colors, typography, spacing, and component styles that automatically adapt to light and dark modes.

## 🎨 Features

- **Black & White Color Palette**: Clean, professional design following Çiftlik365 brand guidelines
- **Dark/Light Mode Support**: Automatic theme switching based on system preferences
- **Consistent Typography**: Standardized text styles across the app
- **Unified Spacing**: Consistent spacing and sizing for all components
- **Component Presets**: Pre-built styles for common UI components
- **TypeScript Support**: Full type safety (when using TypeScript)

## 📁 File Structure

```
themes/
├── index.js          # Main exports
├── colors.js         # Color palette and theme colors
├── typography.js     # Text styles and font definitions
├── spacing.js        # Spacing, sizing, and layout constants
├── components.js     # Component style presets
├── theme.js          # Main theme configuration
├── useTheme.js       # Theme hook for React components
└── README.md         # This documentation
```

## 🚀 Quick Start

### Basic Usage

```jsx
import { useTheme } from '../themes/useTheme';

function MyComponent() {
  const theme = useTheme();
  
  return (
    <View style={theme.styles.screen()}>
      <Text style={theme.styles.text('h2')}>
        Welcome to Çiftlik365
      </Text>
      <TouchableOpacity style={theme.styles.button('primary')}>
        <Text style={theme.styles.text('button', 'white')}>
          Get Started
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Advanced Usage

```jsx
import { useTheme } from '../themes/useTheme';

function AdvancedComponent() {
  const theme = useTheme();
  
  const customCardStyle = {
    ...theme.styles.card('elevated'),
    marginHorizontal: theme.spacing.lg,
    backgroundColor: theme.isDark ? theme.colors.surface : theme.colors.white,
  };
  
  return (
    <View style={customCardStyle}>
      <Text style={theme.styles.text('h3', 'primary')}>
        Custom Styled Card
      </Text>
    </View>
  );
}
```

## 🎨 Colors

### Usage
```jsx
const theme = useTheme();

// Direct color access
const primaryColor = theme.colors.primary;
const backgroundColor = theme.colors.background;

// Using quick access
const textColor = theme.quick.textColor;
```

### Available Colors
- **Primary**: `primary`, `secondary`
- **Background**: `background`, `surface`, `card`
- **Text**: `text`, `textSecondary`, `textMuted`, `textDisabled`
- **Interactive**: `tint`, `icon`, `iconActive`
- **State**: `success`, `error`, `warning`, `info`
- **Border**: `border`, `borderLight`, `borderFocus`

## ✍️ Typography

### Usage
```jsx
const theme = useTheme();

// Using style generators
<Text style={theme.styles.text('h1')}>Heading</Text>
<Text style={theme.styles.text('body')}>Body text</Text>
<Text style={theme.styles.text('caption', 'textSecondary')}>Caption</Text>

// Direct access
const headerStyle = theme.typography.styles.h1;
```

### Available Styles
- **Headers**: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`
- **Body**: `bodyLarge`, `body`, `bodySmall`
- **UI**: `button`, `buttonSmall`, `caption`, `overline`
- **Special**: `link`, `code`, `tabLabel`
- **Forms**: `label`, `input`, `placeholder`, `helperText`, `errorText`

## 📏 Spacing

### Usage
```jsx
const theme = useTheme();

// Direct spacing values
const padding = theme.spacing.lg; // 16px
const margin = theme.spacing['2xl']; // 24px

// Layout spacing
const screenPadding = theme.spacing.layout.screenPadding;
const cardPadding = theme.spacing.component.cardPadding;
```

### Available Spacing
- **Scale**: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl`, `5xl`, `6xl`
- **Layout**: `screenPadding`, `sectionGap`, `cardPadding`, etc.
- **Components**: `buttonVertical`, `inputHorizontal`, `listItemPadding`, etc.
- **Sizes**: `buttonHeight`, `inputHeight`, `avatarSizes`, etc.

## 🧩 Components

### Button Styles
```jsx
const theme = useTheme();

// Different variants
<TouchableOpacity style={theme.styles.button('primary')}>
<TouchableOpacity style={theme.styles.button('secondary')}>
<TouchableOpacity style={theme.styles.button('outline')}>
<TouchableOpacity style={theme.styles.button('primary', 'small')}>
```

### Input Styles
```jsx
// Different states
<TextInput style={theme.styles.input('default')} />
<TextInput style={theme.styles.input('focused')} />
<TextInput style={theme.styles.input('error')} />
```

### Card Styles
```jsx
// Different variants
<View style={theme.styles.card('base')}>
<View style={theme.styles.card('elevated')}>
<View style={theme.styles.card('flat')}>
```

## 🛠️ Utilities

### Theme Detection
```jsx
const theme = useTheme();

if (theme.isDark) {
  // Dark mode specific logic
}

if (theme.isLight) {
  // Light mode specific logic
}
```

### Utility Functions
```jsx
const theme = useTheme();

// Get colors with fallbacks
const color = theme.utils.getColor('customColor', theme.colors.text);

// Get component styles
const buttonStyle = theme.utils.getComponent('button', 'primary');

// Apply custom colors to base styles
const customButton = theme.utils.applyColors(
  theme.components.button.base,
  { backgroundColor: '#custom-color' }
);
```

## 🔄 Migration from Old System

If you're migrating from the old `Colors.jsx` and `ThemedText.jsx` system:

### Before
```jsx
import { Colors } from '../constants/Colors';
import { ThemedText } from '../components/ThemedText';

<View style={{ backgroundColor: Colors.light.background }}>
  <ThemedText type="title">Hello</ThemedText>
</View>
```

### After
```jsx
import { useTheme } from '../themes/useTheme';

const theme = useTheme();

<View style={theme.styles.screen()}>
  <Text style={theme.styles.text('h1')}>Hello</Text>
</View>
```

## 📱 Best Practices

1. **Always use the theme system** instead of hardcoded colors or sizes
2. **Use semantic color names** (e.g., `text`, `background`) rather than specific colors
3. **Prefer style generators** over direct access to design tokens
4. **Test in both light and dark modes** to ensure proper contrast
5. **Use spacing constants** for consistent layout
6. **Leverage component presets** for common UI patterns

## 🎯 Examples

### Complete Screen Example
```jsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../themes/useTheme';

function ExampleScreen() {
  const theme = useTheme();
  
  return (
    <ScrollView style={theme.styles.screen()}>
      <View style={theme.styles.card()}>
        <Text style={theme.styles.text('h2')}>
          Farm Dashboard
        </Text>
        <Text style={theme.styles.text('body', 'textSecondary')}>
          Welcome back to your farm management system
        </Text>
        
        <TouchableOpacity 
          style={[
            theme.styles.button('primary'),
            { marginTop: theme.spacing.lg }
          ]}
        >
          <Text style={theme.styles.text('button', 'white')}>
            View Animals
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default ExampleScreen;
```

This theme system ensures consistency across your entire app while providing the flexibility to customize when needed. All components will automatically adapt to light/dark mode changes, making your app feel native and polished. 