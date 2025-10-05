import { router } from 'expo-router';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { farmAPI } from '../services/api';
import { useAuth } from './AuthContext';

const FarmContext = createContext({});

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (context === undefined) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};

export function FarmProvider({ children }) {
  const { user } = useAuth();
  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);

  // Kullanıcının çiftlik bilgilerini yükle
  const loadUserFarm = useCallback(async () => {
    if (!user) {
      setFarm(null);
      setLoading(false);
      setNeedsSetup(false);
      return;
    }

    try {
      setLoading(true);
      const farmData = await farmAPI.getUserFarm();
      
      if (!farmData) {
        // Çiftlik bulunamadı - setup'a yönlendir
        setNeedsSetup(true);
        setFarm(null);
        
        // Sadece setup sayfasında değilse yönlendir
        const currentPath = router.pathname || '';
        if (!currentPath.includes('/farm/setup') && !currentPath.includes('/signup')) {
          router.replace('/farm/setup');
        }
      } else {
        // Çiftlik mevcut
        setNeedsSetup(false);
        setFarm(farmData);
      }
    } catch (error) {
      console.error('Load user farm error:', error);
      setFarm(null);
      setNeedsSetup(true);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Çiftlik oluştur
  const createFarm = useCallback(async (farmData) => {
    try {
      const newFarm = await farmAPI.createFarm(farmData);
      setFarm(newFarm);
      setNeedsSetup(false);
      return newFarm;
    } catch (error) {
      console.error('Create farm error:', error);
      throw error;
    }
  }, []);

  // Çiftlik güncelle
  const updateFarm = useCallback(async (farmData) => {
    try {
      const updatedFarm = await farmAPI.updateFarm(farmData);
      setFarm(updatedFarm);
      return updatedFarm;
    } catch (error) {
      console.error('Update farm error:', error);
      throw error;
    }
  }, []);

  // Çiftlik bilgilerini yenile
  const refreshFarm = useCallback(async () => {
    await loadUserFarm();
  }, [loadUserFarm]);

  // Kullanıcı değiştiğinde çiftlik bilgilerini yeniden yükle
  useEffect(() => {
    loadUserFarm();
  }, [loadUserFarm]);

  const value = {
    // State
    farm,
    loading,
    needsSetup,

    // Actions
    createFarm,
    updateFarm,
    refreshFarm,
    
    // Legacy compatibility (bazı componentler bunları bekliyebilir)
    activeFarm: farm,
    userFarms: farm ? [farm] : [],
    userRole: 'owner', // Tek kullanıcılı sistemde her zaman owner
    switchToFarm: () => {}, // No-op since only one farm
    permissions: {
      canViewFarm: true,
      canEditFarm: true,
      canManageMembers: false,
      canInviteMembers: false,
      canDeleteFarm: true,
      canViewReports: true,
      canManageAnimals: true,
      canManageFeeds: true,
      canManageFinances: true,
      canViewFinances: true,
    }
  };

  return (
    <FarmContext.Provider value={value}>
      {children}
    </FarmContext.Provider>
  );
}