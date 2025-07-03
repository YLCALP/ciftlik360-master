import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashMessageService } from '../../../components/common/FlashMessage';
import { settingsAPI } from '../../../services/api';
import { useTheme } from '../../../themes';

export default function FeedSettings() {
  const [settings, setSettings] = useState({
    calculation_method: 'daily_consumption',
    auto_decrease_stock: false,
    default_consumption_time: '08:00',
    low_stock_threshold: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const theme = useTheme();
  const styles = getStyles(theme);

  const methods = [
    { key: 'daily_consumption', name: 'Günlük Tüketim', description: 'Her hayvan türü için günlük sabit bir tüketim miktarı belirleyin. Stoklar her gün bu miktarda otomatik olarak düşülür.' },
    { key: 'manual_entry', name: 'Manuel Giriş', description: 'Yem tüketimini her seferinde manuel olarak siz girin. Otomatik stok düşümü olmaz.' },
  ];

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await settingsAPI.getFeedSettings();
      if (data) setSettings(data);
    } catch (error) {
      FlashMessageService.error('Hata', 'Ayarlar yüklenirken bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsAPI.updateFeedSettings(settings);
      FlashMessageService.success('Başarılı', 'Ayarlarınız kaydedildi.');
    } catch (error) {
      FlashMessageService.error('Hata', 'Ayarlar kaydedilirken bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const setCalculationMethod = (method) => setSettings(prev => ({ ...prev, calculation_method: method }));
  const toggleAutoDecrease = () => setSettings(prev => ({ ...prev, auto_decrease_stock: !prev.auto_decrease_stock }));

  if (loading) {
    return <SafeAreaView style={styles.container}><View style={styles.loadingContainer}><ActivityIndicator color={theme.colors.primary} /></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
            <Text style={styles.title}>Yem Tüketim Ayarları</Text>
            <Text style={styles.subtitle}>Yem stoklarınızın nasıl yönetileceğini belirleyin.</Text>
        </View>
        <View style={styles.content}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hesaplama Yöntemi</Text>
                {methods.map(method => (
                    <TouchableOpacity key={method.key} style={[styles.methodCard, settings.calculation_method === method.key && styles.selectedMethodCard]} onPress={() => setCalculationMethod(method.key)}>
                        <View style={styles.radioCircle}><View style={settings.calculation_method === method.key && styles.radioInner} /></View>
                        <View style={styles.methodDetails}>
                            <Text style={styles.methodName}>{method.name}</Text>
                            <Text style={styles.methodDescription}>{method.description}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Otomasyon</Text>
                <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Stokları Otomatik Düş</Text>
                    <Switch
                        value={settings.auto_decrease_stock}
                        onValueChange={toggleAutoDecrease}
                        trackColor={{ false: theme.colors.surface, true: theme.colors.primary }}
                        thumbColor={theme.colors.card}
                    />
                </View>
                <Text style={styles.settingDescription}>Bu ayar aktif ise, tüketim hesaplamaları her gün belirlediğiniz saatte otomatik olarak yapılır ve stoktan düşülür.</Text>
            </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.saveButton, saving && styles.disabledButton]} onPress={handleSave} disabled={saving}>
          <Text style={styles.saveButtonText}>{saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  header: { padding: theme.spacing.lg, backgroundColor: theme.colors.card, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  title: { ...theme.typography.styles.h2, color: theme.colors.text },
  subtitle: { ...theme.typography.styles.body, color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
  content: { padding: theme.spacing.lg },
  section: { marginBottom: theme.spacing.xl },
  sectionTitle: { ...theme.typography.styles.h4, color: theme.colors.text, marginBottom: theme.spacing.md },
  methodCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: theme.colors.card, borderRadius: theme.spacing.radius.lg, padding: theme.spacing.lg, borderWidth: 2, borderColor: theme.colors.border, marginBottom: theme.spacing.md },
  selectedMethodCard: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryMuted },
  radioCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md, marginTop: 2 },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.primary },
  methodDetails: { flex: 1 },
  methodName: { ...theme.typography.styles.h6, color: theme.colors.text },
  methodDescription: { ...theme.typography.styles.caption, color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.card, borderRadius: theme.spacing.radius.lg, padding: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border },
  switchLabel: { ...theme.typography.styles.h6, color: theme.colors.text },
  settingDescription: { ...theme.typography.styles.caption, color: theme.colors.textMuted, marginTop: theme.spacing.md, paddingHorizontal: theme.spacing.sm },
  footer: { padding: theme.spacing.lg, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.card },
  saveButton: { ...theme.styles.button('primary') },
  saveButtonText: { ...theme.styles.text('button', 'primaryText') },
  disabledButton: { backgroundColor: theme.colors.disabled },
}); 