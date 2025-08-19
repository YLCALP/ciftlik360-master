import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FeedCard } from '../../../components/FeedCard';
import { SearchBar } from '../../../components/common/SearchBar';
import { feedAPI } from '../../../services/api';
import { useTheme } from '../../../themes';


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
      <Text style={styles.emptyTitle}>Henüz yem stoku yok</Text>
      <Text style={styles.emptyText}>
        İlk yem stokunuzu eklemek için aşağıdaki butona dokunun
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleAddFeed}>
        <Text style={styles.emptyButtonText}>🌾 Yem Ekle</Text>
      </TouchableOpacity>
    </View>
  ), [handleAddFeed, styles]);

  const renderFeed = useCallback(({ item }) => (
    <FeedCard
      feed={item}
      onPress={handleEditFeed}
    />
  ), [handleEditFeed]);

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

      <SearchBar
        placeholder="Yem ara (ad, marka, tür...)"
        value={searchText}
        onChangeText={setSearchText}
        showClearButton={true}
      />


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


const getScreenStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    ...theme.typography.styles.bodyLarge,
    color: theme.colors.textSecondary,
  },
  headerContainer: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.layout.screenPadding,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
    marginBottom: 0,
  },
  title: {
    ...theme.typography.styles.h2,
    color: theme.colors.text,
    fontWeight: '700',
  },
  subtitle: {
    ...theme.typography.styles.bodySmall,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  addButton: {
    width: theme.spacing.sizes.button.height,
    height: theme.spacing.sizes.button.height,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.spacing.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.spacing.shadows.md,
  },
  addButtonText: {
    color: theme.colors.white,
    fontSize: theme.spacing.iconSizes.lg,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: theme.spacing.layout.screenPadding,
    paddingVertical: theme.spacing.layout.contentGap,
  },
  listContainerEmpty: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing['6xl'],
    paddingVertical: theme.spacing['8xl'],
  },
  emptyEmoji: {
    fontSize: theme.spacing.iconSizes['5xl'],
    marginBottom: theme.spacing.layout.sectionGap,
  },
  emptyTitle: {
    ...theme.typography.styles.h3,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.layout.contentGap,
    fontWeight: '700',
  },
  emptyText: {
    ...theme.typography.styles.bodyLarge,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.layout.sectionGapLarge,
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.component.button.paddingHorizontal,
    paddingVertical: theme.spacing.component.button.paddingVertical,
    borderRadius: theme.spacing.component.button.radius,
    ...theme.spacing.shadows.lg,
    shadowColor: theme.colors.secondary,
  },
  emptyButtonText: {
    ...theme.typography.styles.button,
    color: theme.colors.text,
    textAlign: 'center',
    fontWeight: '700',
  },
}); 