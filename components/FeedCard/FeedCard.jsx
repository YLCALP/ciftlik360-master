import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../themes';
import { getFeedCardStyles } from './FeedCard.styles';

export const FeedCard = React.memo(({ feed, onPress }) => {
  const theme = useTheme();
  const styles = getFeedCardStyles(theme);

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
    if (quantity <= 0) {
      return { 
        text: 'Tükendi', 
        color: theme.colors.error, 
        bg: theme.colors.errorMuted 
      };
    }
    if (quantity <= minStock) {
      return { 
        text: 'Düşük Stok', 
        color: theme.colors.warning, 
        bg: theme.colors.warningMuted 
      };
    }
    return { 
      text: 'Uygun', 
      color: theme.colors.success, 
      bg: theme.colors.successMuted 
    };
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

  const handlePress = useCallback(() => {
    onPress(feed);
  }, [feed, onPress]);

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={handlePress} 
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>
            {getFeedTypeEmoji(feed.feed_type)}
          </Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.name}>
            {feed.feed_name}
          </Text>
          <Text style={styles.brand}>
            {feed.brand 
              ? `${getFeedTypeText(feed.feed_type)} • ${feed.brand}` 
              : getFeedTypeText(feed.feed_type)}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: stockStatus.bg }]}>
          <Text style={[styles.statusText, { color: stockStatus.color }]}>
            {stockStatus.text}
          </Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Miktar</Text>
          <Text style={styles.metaValue}>
            {feed.quantity} {feed.unit}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Birim Fiyat</Text>
          <Text style={styles.metaValue}>
            {formatCurrency(feed.price_per_unit)}
          </Text>
        </View>
      </View>
      
      {(feed.purchase_date || feed.expiry_date) && (
        <View style={styles.metaRow}>
          {feed.purchase_date && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Alış Tarihi</Text>
              <Text style={styles.metaValue}>
                {formatDate(feed.purchase_date)}
              </Text>
            </View>
          )}
          {feed.expiry_date && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Son Kullanma</Text>
              <Text style={styles.metaValue}>
                {formatDate(feed.expiry_date)}
              </Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
});

FeedCard.displayName = 'FeedCard';