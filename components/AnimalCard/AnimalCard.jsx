import React, { useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../themes';
import { getAnimalCardStyles } from './AnimalCard.styles';

export const AnimalCard = React.memo(({ animal, onPress }) => {
  const theme = useTheme();
  const styles = getAnimalCardStyles(theme);

  const getSpeciesEmoji = (species) => {
    const emojis = { 
      cattle: '🐄', 
      sheep: '🐑', 
      goat: '🐐', 
      poultry: '🐔', 
      other: '🐾' 
    };
    return emojis[species] || '🐾';
  };

  const getStatusInfo = (status) => {
    const info = {
      active: { text: 'Aktif', color: theme.colors.success },
      sick: { text: 'Hasta', color: theme.colors.warning },
      sold: { text: 'Satıldı', color: theme.colors.textMuted },
      deceased: { text: 'Öldü', color: theme.colors.error },
    };
    return info[status] || { text: status, color: theme.colors.textSecondary };
  };

  const formatDate = (date) => {
    return !date ? '-' : new Date(date).toLocaleDateString('tr-TR');
  };

  const handlePress = useCallback(() => {
    onPress(animal);
  }, [animal, onPress]);

  const statusInfo = getStatusInfo(animal.status);

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={handlePress} 
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>
            {getSpeciesEmoji(animal.species)}
          </Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.name}>
            {animal.name || `${getSpeciesEmoji(animal.species)} ${animal.tag_number}`}
          </Text>
          <Text style={styles.tag}>
            Küpe No: {animal.tag_number}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <Text style={styles.statusText}>
              {statusInfo.text}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Cinsiyet</Text>
          <Text style={styles.metaValue}>
            {animal.gender === 'male' ? '♂ Erkek' : '♀ Dişi'}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Doğum Tarihi</Text>
          <Text style={styles.metaValue}>
            {formatDate(animal.birth_date)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

AnimalCard.displayName = 'AnimalCard';