/**
 * Example Usage of Çiftlik365 Theme System
 * This file demonstrates how to use the theme system in your components
 */

import React from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from './useTheme';

// Example: Simple themed component
function ThemedButton({ title, variant = 'primary', size = 'base', onPress, ...props }) {
  const theme = useTheme();
  
  const buttonTextColor = variant === 'primary' ? 'white' : 'text';
  
  return (
    <TouchableOpacity 
      style={theme.styles.button(variant, size)}
      onPress={onPress}
      {...props}
    >
      <Text style={theme.styles.text('button', buttonTextColor)}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

// Example: Complete screen with theme usage
function ExampleThemeScreen() {
  const theme = useTheme();
  
  return (
    <ScrollView style={theme.styles.screen()}>
      {/* Header Section */}
      <View style={theme.styles.card()}>
        <Text style={theme.styles.text('h1')}>
          Çiftlik365 Dashboard
        </Text>
        <Text style={theme.styles.text('body', 'textSecondary')}>
          Welcome back! Here's your farm overview for today.
        </Text>
      </View>
      
      {/* Stats Cards */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: theme.spacing.lg,
        gap: theme.spacing.md,
      }}>
        <View style={[
          theme.styles.card('stats'),
          { flex: 1 }
        ]}>
          <Text style={theme.styles.text('h3', 'primary')}>127</Text>
          <Text style={theme.styles.text('caption', 'textSecondary')}>
            Total Animals
          </Text>
        </View>
        
        <View style={[
          theme.styles.card('stats'),
          { flex: 1 }
        ]}>
          <Text style={theme.styles.text('h3', 'success')}>₺15,420</Text>
          <Text style={theme.styles.text('caption', 'textSecondary')}>
            Monthly Revenue
          </Text>
        </View>
      </View>
      
      {/* Form Example */}
      <View style={theme.styles.card()}>
        <Text style={theme.styles.text('h4')}>
          Quick Add Animal
        </Text>
        
        <View style={{ marginTop: theme.spacing.lg }}>
          <Text style={theme.styles.text('label')}>
            Animal Name
          </Text>
          <TextInput
            style={theme.styles.input()}
            placeholder="Enter animal name..."
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>
        
        <View style={{ marginTop: theme.spacing.md }}>
          <Text style={theme.styles.text('label')}>
            Type
          </Text>
          <TextInput
            style={theme.styles.input()}
            placeholder="e.g., Cow, Sheep, Chicken..."
            placeholderTextColor={theme.colors.textMuted}
          />
        </View>
        
        <View style={{
          flexDirection: 'row',
          gap: theme.spacing.md,
          marginTop: theme.spacing.xl,
        }}>
          <ThemedButton 
            title="Cancel" 
            variant="outline" 
            style={{ flex: 1 }}
          />
          <ThemedButton 
            title="Add Animal" 
            variant="primary" 
            style={{ flex: 1 }}
          />
        </View>
      </View>
      
      {/* Action Buttons */}
      <View style={{ gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
        <ThemedButton title="View All Animals" variant="primary" />
        <ThemedButton title="Feed Management" variant="secondary" />
        <ThemedButton title="Financial Reports" variant="outline" />
      </View>
      
      {/* Theme Info (for demonstration) */}
      <View style={[
        theme.styles.card('flat'),
        { 
          marginTop: theme.spacing['2xl'],
          borderWidth: 1,
          borderColor: theme.colors.border,
        }
      ]}>
        <Text style={theme.styles.text('h6')}>
          Theme Information
        </Text>
        <Text style={theme.styles.text('caption', 'textSecondary')}>
          Current mode: {theme.mode}
        </Text>
        <Text style={theme.styles.text('caption', 'textSecondary')}>
          Is Dark: {theme.isDark ? 'Yes' : 'No'}
        </Text>
        <Text style={theme.styles.text('caption', 'textSecondary')}>
          Primary Color: {theme.colors.primary}
        </Text>
      </View>
    </ScrollView>
  );
}

// Example: Custom styled component using theme utilities
function CustomCard({ children, elevated = false }) {
  const theme = useTheme();
  
  const cardStyle = {
    ...theme.styles.card(elevated ? 'elevated' : 'base'),
    // Custom modifications
    borderRadius: theme.spacing.radius['2xl'],
    marginHorizontal: theme.spacing.sm,
    // Conditional styling based on theme
    backgroundColor: theme.isDark 
      ? theme.colors.surface 
      : theme.colors.white,
  };
  
  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
}

// Example: Using theme utilities for complex styling
function AdvancedStyledComponent() {
  const theme = useTheme();
  
  // Using utility functions
  const customButtonStyle = theme.utils.applyColors(
    theme.components.button.base,
    {
      backgroundColor: theme.utils.getColor('success'),
      borderColor: theme.utils.getColor('success'),
    }
  );
  
  const customTextStyle = {
    ...theme.utils.getTypography('h4'),
    color: theme.utils.getColor('textSecondary'),
    marginBottom: theme.utils.getSpacing('lg'),
  };
  
  return (
    <View style={theme.styles.screen('centered')}>
      <Text style={customTextStyle}>
        Advanced Styling Example
      </Text>
      
      <TouchableOpacity style={customButtonStyle}>
        <Text style={theme.styles.text('button', 'white')}>
          Custom Success Button
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export {
    AdvancedStyledComponent, CustomCard, ExampleThemeScreen, ThemedButton
};
