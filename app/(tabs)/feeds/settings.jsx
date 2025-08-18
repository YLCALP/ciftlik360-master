import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashMessageService } from '../../../components/common/FlashMessage';
import { feedConsumptionAPI } from '../../../services/api';
import { useTheme } from '../../../themes';

export default function FeedSettings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const theme = useTheme();
  const styles = getStyles(theme);

  // Hayvan türleri ve yem tipleri
  const animalTypes = [
    { key: 'cattle', name: 'Büyükbaş', emoji: '🐄' },
    { key: 'sheep', name: 'Küçükbaş (Koyun)', emoji: '🐑' },
    { key: 'goat', name: 'Küçükbaş (Keçi)', emoji: '🐐' },
    { key: 'poultry', name: 'Kümes Hayvanları', emoji: '🐔' },
  ];

  const feedTypes = [
    { key: 'concentrate', name: 'Konsantre Yem' },
    { key: 'roughage', name: 'Kaba Yem' },
    { key: 'supplement', name: 'Takviye/Vitamin' },
  ];

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await feedConsumptionAPI.getConsumptionSettings();
      
      // Tüm hayvan ve yem kombinasyonları için ayarları oluştur
      const allSettings = [];
      for (const animal of animalTypes) {
        for (const feed of feedTypes) {
          const existing = data?.find(s => s.species === animal.key && s.feed_type === feed.key);
          allSettings.push({
            species: animal.key,
            feed_type: feed.key,
            daily_consumption_per_animal: existing?.daily_consumption_per_animal || 0,
            auto_deduct_enabled: existing?.auto_deduct_enabled || false,
            id: existing?.id || null,
          });
        }
      }
      setSettings(allSettings);
    } catch (error) {
      console.error('Load settings error:', error);
      FlashMessageService.error('Hata', 'Ayarlar yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    loadSettings(); 
  }, [loadSettings]);

  const handleConsumptionChange = (species, feedType, value) => {
    setSettings(prev => prev.map(s => 
      s.species === species && s.feed_type === feedType 
        ? { ...s, daily_consumption_per_animal: parseFloat(value) || 0 }
        : s
    ));
  };

  const handleAutoDeductToggle = (species, feedType) => {
    setSettings(prev => prev.map(s => 
      s.species === species && s.feed_type === feedType 
        ? { ...s, auto_deduct_enabled: !s.auto_deduct_enabled }
        : s
    ));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Sadece değiştirilmiş ayarları kaydet
      const promises = settings
        .filter(s => s.daily_consumption_per_animal > 0 || s.id)
        .map(setting => feedConsumptionAPI.updateConsumptionSetting(setting));
      
      await Promise.all(promises);
      
      FlashMessageService.success('Başarılı', 'Tüketim ayarları kaydedildi.');
      loadSettings(); // Yeniden yükle
    } catch (error) {
      console.error('Save settings error:', error);
      FlashMessageService.error('Hata', 'Ayarlar kaydedilirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const getAnimalName = (key) => animalTypes.find(a => a.key === key)?.name || key;
  const getAnimalEmoji = (key) => animalTypes.find(a => a.key === key)?.emoji || '🐾';
  const getFeedName = (key) => feedTypes.find(f => f.key === key)?.name || key;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Yem Tüketim Ayarları</Text>
          <Text style={styles.subtitle}>
            Her hayvan türü için günlük yem tüketim miktarlarını belirleyin
          </Text>
        </View>

        <View style={styles.content}>
          {animalTypes.map(animal => (
            <View key={animal.key} style={styles.animalSection}>
              <View style={styles.animalHeader}>
                <Text style={styles.animalEmoji}>{animal.emoji}</Text>
                <Text style={styles.animalName}>{animal.name}</Text>
              </View>
              
              {feedTypes.map(feed => {
                const setting = settings.find(s => 
                  s.species === animal.key && s.feed_type === feed.key
                );
                
                return (
                  <View key={feed.key} style={styles.feedCard}>
                    <View style={styles.feedHeader}>
                      <Text style={styles.feedName}>{feed.name}</Text>
                      <Switch
                        value={setting?.auto_deduct_enabled || false}
                        onValueChange={() => handleAutoDeductToggle(animal.key, feed.key)}
                        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                        thumbColor={theme.colors.card}
                      />
                    </View>
                    
                    <View style={styles.inputRow}>
                      <Text style={styles.inputLabel}>Günlük Tüketim (kg/hayvan):</Text>
                      <TextInput
                        style={styles.input}
                        value={setting?.daily_consumption_per_animal?.toString() || ''}
                        onChangeText={(value) => handleConsumptionChange(animal.key, feed.key, value)}
                        keyboardType="decimal-pad"
                        placeholder="0.0"
                        placeholderTextColor={theme.colors.textMuted}
                      />
                    </View>
                    
                    {setting?.auto_deduct_enabled && setting?.daily_consumption_per_animal > 0 && (
                      <Text style={styles.infoText}>
                        <Ionicons name="information-circle-outline" size={14} color={theme.colors.info} />
                        {' '}Günlük {setting.daily_consumption_per_animal} kg otomatik düşülecek
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          ))}

          <View style={styles.infoSection}>
            <Ionicons name="information-circle" size={24} color={theme.colors.info} />
            <Text style={styles.infoSectionText}>
              Otomatik stok düşümü aktif olan yemler, her gün belirlediğiniz miktarda 
              hayvan sayısı ile çarpılarak stoktan düşülür. Stok kritik seviyeye 
              düştüğünde bildirim alırsınız.
            </Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.disabledButton]} 
          onPress={handleSave} 
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  scrollView: { 
    flex: 1 
  },
  header: { 
    padding: theme.spacing.lg, 
    backgroundColor: theme.colors.card, 
    borderBottomWidth: 1, 
    borderBottomColor: theme.colors.border 
  },
  title: { 
    ...theme.typography.styles.h2, 
    color: theme.colors.text 
  },
  subtitle: { 
    ...theme.typography.styles.body, 
    color: theme.colors.textSecondary, 
    marginTop: theme.spacing.xs 
  },
  content: { 
    padding: theme.spacing.lg 
  },
  animalSection: {
    marginBottom: theme.spacing['2xl'],
  },
  animalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  animalEmoji: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  animalName: {
    ...theme.typography.styles.h4,
    color: theme.colors.text,
  },
  feedCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  feedName: {
    ...theme.typography.styles.h6,
    color: theme.colors.text,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputLabel: {
    ...theme.typography.styles.body,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.spacing.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    width: 100,
    textAlign: 'center',
    fontSize: 16,
    color: theme.colors.text,
  },
  infoText: {
    ...theme.typography.styles.caption,
    color: theme.colors.info,
    marginTop: theme.spacing.sm,
  },
  infoSection: {
    flexDirection: 'row',
    backgroundColor: theme.colors.info + '20',
    borderRadius: theme.spacing.radius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.xl,
  },
  infoSectionText: {
    ...theme.typography.styles.body,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  footer: { 
    padding: theme.spacing.lg, 
    borderTopWidth: 1, 
    borderTopColor: theme.colors.border, 
    backgroundColor: theme.colors.card 
  },
  saveButton: { 
    ...theme.styles.button('primary'),
    paddingVertical: theme.spacing.lg,
  },
  saveButtonText: { 
    ...theme.styles.text('button', 'primaryText'),
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: { 
    backgroundColor: theme.colors.textDisabled 
  },
}); 