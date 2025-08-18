import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { feedAPI } from '../../../services/api';
import { useTheme } from '../../../themes';

const FeedCard = React.memo(({ feed, onPress }) => {
  const theme = useTheme();
  const styles = getCardStyles(theme);

  const getFeedTypeEmoji = (feedType) => {
    const emojis = {
      concentrate: '🌾',
      roughage: '🌿',
      supplement: '💊',
      other: '🥜',
    };
    return emojis[feedType] || '🥜';
  };

  const getFeedTypeText = (feedType) => {
    const texts = {
      concentrate: 'Konsantre',
      roughage: 'Kaba Yem',
      supplement: 'Takviye',
      other: 'Diğer',
    };
    return texts[feedType] || feedType;
  };

  const getStockStatus = (quantity, minStock) => {
    if (quantity <= 0) return { text: 'Tükendi', color: theme.colors.error, bg: theme.colors.errorMuted };
    if (quantity <= minStock) return { text: 'Düşük Stok', color: theme.colors.warning, bg: theme.colors.warningMuted };
    return { text: 'Uygun', color: theme.colors.success, bg: theme.colors.successMuted };
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('tr-TR');
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const stockStatus = getStockStatus(feed.quantity, feed.min_stock_level || 0);

  const handlePress = useCallback(() => onPress(feed), [feed, onPress]);

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{getFeedTypeEmoji(feed.feed_type)}</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.name}>{feed.feed_name}</Text>
          <Text style={styles.brand}>
            {feed.brand ? `${getFeedTypeText(feed.feed_type)} • ${feed.brand}` : getFeedTypeText(feed.feed_type)}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: stockStatus.bg }]}>
          <Text style={[styles.statusText, { color: stockStatus.color }]}>{stockStatus.text}</Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Miktar</Text>
          <Text style={styles.metaValue}>{feed.quantity} {feed.unit}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Birim Fiyat</Text>
          <Text style={styles.metaValue}>{formatCurrency(feed.price_per_unit)}</Text>
        </View>
      </View>
      
      {(feed.purchase_date || feed.expiry_date) && (
        <View style={styles.metaRow}>
          {feed.purchase_date && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Alış Tarihi</Text>
              <Text style={styles.metaValue}>{formatDate(feed.purchase_date)}</Text>
            </View>
          )}
          {feed.expiry_date && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Son Kullanma</Text>
              <Text style={styles.metaValue}>{formatDate(feed.expiry_date)}</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
});

export default function FeedsScreen() {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');

  const theme = useTheme();
  const styles = getScreenStyles(theme);

  // Filtrelenmiş yemler
  const filteredFeeds = useMemo(() => {
    if (!searchText.trim()) {
      return feeds;
    }
    
    const searchLower = searchText.toLowerCase();
    return feeds.filter(feed => 
      feed.feed_name?.toLowerCase().includes(searchLower) ||
      feed.brand?.toLowerCase().includes(searchLower) ||
      feed.feed_type?.toLowerCase().includes(searchLower) ||
      feed.supplier?.toLowerCase().includes(searchLower)
    );
  }, [feeds, searchText]);

  const loadFeeds = useCallback(async () => {
    try {
      !refreshing && setLoading(true);
      const data = await feedAPI.getFeeds();
      setFeeds(data || []);
    } catch (error) {
      console.error('Load feeds error:', error);
      Alert.alert('Hata', 'Yemler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  // Sayfa her açıldığında yemler yeniden yükle
  useFocusEffect(
    useCallback(() => {
      loadFeeds();
    }, [loadFeeds])
  );

  useEffect(() => {
    loadFeeds();
  }, [loadFeeds]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFeeds();
  }, [loadFeeds]);

  const handleAddFeed = useCallback(() => {
    router.push('/feeds/add');
  }, []);

  const handleEditFeed = useCallback((feed) => {
    router.push(`/feeds/detail/${feed.id}`);
  }, []);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🌾</Text>
      <Text style={styles.emptyTitle}>Henüz yem yok</Text>
      <Text style={styles.emptyText}>
        İlk yem stokunuzu eklemek için yukarıdaki + butonuna basın
      </Text>
      <TouchableOpacity style={theme.styles.button('primary')} onPress={handleAddFeed}>
        <Text style={theme.styles.text('button', 'primaryText')}>Yem Ekle</Text>
      </TouchableOpacity>
    </View>
  ), [handleAddFeed, theme.styles]);

  const renderFeed = useCallback(({ item }) => (
    <FeedCard
      feed={item}
      onPress={handleEditFeed}
    />
  ), [handleEditFeed]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.title}>Yem Stokları</Text>
          <Text style={styles.subtitle}>{filteredFeeds.length} yem {searchText ? '(filtrelenmiş)' : ''}</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddFeed}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Yem ara (ad, marka, tür...)"
            placeholderTextColor={theme.colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setSearchText('')}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Consumption Management Buttons */}
      <View style={styles.managementContainer}>
        <TouchableOpacity 
          style={styles.managementButton} 
          onPress={() => router.push('/feeds/settings')}
        >
          <Text style={styles.managementButtonText}>⚙️ Tüketim Ayarları</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.managementButton} 
          onPress={() => router.push('/feeds/consumption-reports')}
        >
          <Text style={styles.managementButtonText}>📊 Tüketim Raporları</Text>
        </TouchableOpacity>
      </View>

      {/* Feed List */}
      <FlatList
        data={filteredFeeds}
        renderItem={renderFeed}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          filteredFeeds.length === 0 && styles.listContainerEmpty
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const getCardStyles = (theme) => StyleSheet.create({
  card: { backgroundColor: theme.colors.card, borderRadius: theme.spacing.radius.xl, padding: theme.spacing.lg, marginVertical: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.border, shadowColor: theme.colors.shadow, ...theme.spacing.shadows.md },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.lg },
  emojiContainer: { width: 48, height: 48, borderRadius: theme.spacing.radius.lg, backgroundColor: theme.colors.surface, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
  emoji: { fontSize: 28 },
  details: { flex: 1 },
  name: { ...theme.typography.styles.h6, color: theme.colors.text },
  brand: { ...theme.typography.styles.caption, color: theme.colors.textSecondary },
  statusBadge: { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.xs, borderRadius: theme.spacing.radius.full },
  statusText: { ...theme.typography.styles.caption, fontWeight: theme.typography.weights.bold },
  metaRow: { flexDirection: 'row', gap: theme.spacing.md, marginTop: theme.spacing.sm },
  metaItem: { flex: 1, backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.spacing.radius.lg },
  metaLabel: { ...theme.typography.styles.overline, color: theme.colors.textSecondary, marginBottom: theme.spacing.xs },
  metaValue: { ...theme.typography.styles.bodySmall, color: theme.colors.text, fontWeight: theme.typography.weights.medium },
});

const getScreenStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...theme.typography.styles.body, color: theme.colors.textSecondary },
  headerContainer: { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  title: { ...theme.typography.styles.h2, color: theme.colors.text },
  subtitle: { ...theme.typography.styles.caption, color: theme.colors.textSecondary, marginTop: theme.spacing.xs },
  addButton: { width: 44, height: 44, backgroundColor: theme.colors.primary, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: theme.colors.primaryText, fontSize: 24, fontWeight: 'bold' },
  searchContainer: { padding: theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.spacing.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  searchIcon: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.text,
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  clearButtonText: {
    fontSize: theme.typography.sizes.caption,
    color: theme.colors.textSecondary,
  },
  managementContainer: { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md, flexDirection: 'row', gap: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  managementButton: { ...theme.styles.button('outline'), flex: 1, paddingVertical: theme.spacing.md },
  managementButtonText: { ...theme.styles.text('button'), fontSize: theme.typography.sizes.sm, color: theme.colors.text },
  listContainer: { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md },
  listContainerEmpty: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: { ...theme.typography.styles.h3, color: theme.colors.text, marginBottom: theme.spacing.md },
  emptyText: { ...theme.typography.styles.body, color: theme.colors.textSecondary, textAlign: 'center', marginBottom: theme.spacing.xl },
}); 