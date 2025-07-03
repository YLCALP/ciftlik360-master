import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import React, { useCallback } from 'react';

export function HapticTab(props) {
  const handlePress = useCallback((event) => {
    if (process.env.NODE_ENV !== 'development') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (props.onPress) {
      props.onPress(event);
    }
  }, [props.onPress]);

  return (
    <PlatformPressable 
      {...props} 
      onPress={handlePress} 
    />
  );
} 