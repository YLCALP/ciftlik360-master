import { router } from 'expo-router';
import React, { useEffect } from 'react';

export default function SignUpScreen() {
  // Redirect to new signup wizard
  useEffect(() => {
    router.replace('/(auth)/signup-wizard');
  }, []);

  // Return null since we're redirecting
  return null;
}