import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlashMessageService } from '../../../components/common/FlashMessage';
import { animalsAPI } from '../../../services/api';
import { useTheme } from '../../../themes';

const AnimalCard = React.memo(({ animal, onPress }) => {
  const theme = useTheme();
  const styles = getCardStyles(theme);

  const getSpeciesEmoji = (species) => {
    const emojis = { cattle: '🐄', sheep: '🐑', goat: '🐐', poultry: '🐔', other: '🐾' };
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

  const formatDate = (date) => !date ? '-' : new Date(date).toLocaleDateString('tr-TR');
  const handlePress = useCallback(() => onPress(animal), [animal, onPress]);
  const statusInfo = getStatusInfo(animal.status);

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{getSpeciesEmoji(animal.species)}</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.name}>{animal.name || `${getSpeciesEmoji(animal.species)} ${animal.tag_number}`}</Text>
          <Text style={styles.tag}>Küpe No: {animal.tag_number}</Text>
        </View>
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <Text style={styles.statusText}>{statusInfo.text}</Text>
          </View>
        </View>
      </View>
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Cinsiyet</Text>
          <Text style={styles.metaValue}>{animal.gender === 'male' ? '♂ Erkek' : '♀ Dişi'}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Doğum Tarihi</Text>
          <Text style={styles.metaValue}>{formatDate(animal.birth_date)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default function AnimalsScreen() {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  const theme = useTheme();
  const styles = getScreenStyles(theme);

  const filteredAnimals = useMemo(() => {
    if (!searchText.trim()) return animals;
    const searchLower = searchText.toLowerCase();
    return animals.filter(animal => 
      animal.name?.toLowerCase().includes(searchLower) ||
      animal.tag_number?.toLowerCase().includes(searchLower)
    );
  }, [animals, searchText]);

  const loadAnimals = useCallback(async () => {
    try {
      !refreshing && setLoading(true);
      const data = await animalsAPI.getAnimals();
      setAnimals(data || []);
    } catch (error) {
      FlashMessageService.error('Hata', 'Hayvanlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useFocusEffect(useCallback(() => { loadAnimals(); }, [loadAnimals]));
  const onRefresh = useCallback(() => { setRefreshing(true); loadAnimals(); }, [loadAnimals]);

  const handleAddAnimal = () => router.push('/animals/add');
  const handleEditAnimal = (animal) => router.push(`/animals/detail/${animal.id}`);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>🐄</Text>
      <Text style={styles.emptyTitle}>Henüz hayvan yok</Text>
      <Text style={styles.emptyText}>İlk hayvanınızı eklemek için + butonuna basın</Text>
      <TouchableOpacity style={theme.styles.button('primary')} onPress={handleAddAnimal}>
        <Text style={theme.styles.text('button', 'primaryText')}>Hayvan Ekle</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}><Text style={styles.loadingText}>Yükleniyor...</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
          <View>
              <Text style={styles.title}>Hayvanlarım</Text>
              <Text style={styles.subtitle}>{filteredAnimals.length} hayvan listeleniyor</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAddAnimal}>
              <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Hayvan ara (ad, küpe no...)"
            placeholderTextColor={theme.colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
          />
      </View>

      <FlatList
        data={filteredAnimals}
        renderItem={({ item }) => <AnimalCard animal={item} onPress={handleEditAnimal} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary}/>}
      />
    </SafeAreaView>
  );
}

const getCardStyles = (theme) => StyleSheet.create({
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.spacing.radius.xl,
        padding: theme.spacing.lg,
        marginVertical: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: theme.colors.shadow,
        ...theme.spacing.shadows.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    emojiContainer: {
        width: 48,
        height: 48,
        borderRadius: theme.spacing.radius.lg,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    emoji: {
        fontSize: 28,
    },
    details: {
        flex: 1,
    },
    name: {
        ...theme.typography.styles.h6,
        color: theme.colors.text,
    },
    tag: {
        ...theme.typography.styles.caption,
        color: theme.colors.textSecondary,
    },
    statusContainer: {
        alignItems: 'flex-end',
    },
    statusBadge: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.spacing.radius.full,
    },
    statusText: {
        ...theme.typography.styles.caption,
        color: theme.colors.white,
        fontWeight: theme.typography.weights.bold,
    },
    metaRow: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    metaItem: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.md,
        borderRadius: theme.spacing.radius.lg,
    },
    metaLabel: {
        ...theme.typography.styles.overline,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
    },
    metaValue: {
        ...theme.typography.styles.bodySmall,
        color: theme.colors.text,
        fontWeight: theme.typography.weights.medium,
    },
});

const getScreenStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.styles.body,
    color: theme.colors.textSecondary,
  },
  headerContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
      ...theme.typography.styles.h2,
      color: theme.colors.text,
  },
  subtitle: {
      ...theme.typography.styles.caption,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
  },
  addButton: {
      width: 44,
      height: 44,
      backgroundColor: theme.colors.primary,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
  },
  addButtonText: {
      color: theme.colors.primaryText,
      fontSize: 24,
      fontWeight: 'bold',
  },
  searchContainer: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchInput: {
      ...theme.styles.input(),
  },
  listContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
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
  emptyTitle: {
    ...theme.typography.styles.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    ...theme.typography.styles.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
}); 