import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimalCard } from '../../../components/AnimalCard';
import { FlashMessageService } from '../../../components/common/FlashMessage';
import { SearchBar } from '../../../components/common/SearchBar';
import { animalsAPI } from '../../../services/api';
import { useTheme } from '../../../themes';


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
      <Text style={styles.emptyText}>İlk hayvanınızı eklemek için aşağıdaki butona dokunun</Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleAddAnimal}>
        <Text style={styles.emptyButtonText}>🐄 Hayvan Ekle</Text>
      </TouchableOpacity>
    </View>
  );


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

      <SearchBar
        placeholder="Hayvan ara (ad, küpe no...)"
        value={searchText}
        onChangeText={setSearchText}
        showClearButton={true}
      />

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
      color: theme.colors.text,
      fontSize: theme.spacing.iconSizes.lg,
      fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: theme.spacing.layout.screenPadding,
    paddingVertical: theme.spacing.layout.contentGap,
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
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.component.button.paddingHorizontal,
    paddingVertical: theme.spacing.component.button.paddingVertical,
    borderRadius: theme.spacing.component.button.radius,
    ...theme.spacing.shadows.lg,
    shadowColor: theme.colors.primary,
  },
  emptyButtonText: {
    ...theme.typography.styles.button,
    color: theme.colors.primaryText,
    textAlign: 'center',
    fontWeight: '700',
  },
}); 