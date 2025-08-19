import { router, useLocalSearchParams } from 'expo-router';
import { Formik } from 'formik';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import * as Yup from 'yup';
import { FlashMessageService } from '../../../components/common/FlashMessage';
import { Icon } from '../../../components/common/Icon';
import DetailHeader from '../../../components/detail/DetailHeader';
import DetailSection from '../../../components/detail/DetailSection';
import DetailTextInput from '../../../components/forms/DetailTextInput';
import DetailButton from '../../../components/forms/DetailButton';
import FormikDatePickerField from '../../../components/forms/FormikDatePickerField';
import { animalsAPI, feedAPI, financialAPI } from '../../../services/api';
import { useTheme } from '../../../themes';

export default function AddFinancialTransactionScreen() {
  const routeParams = useLocalSearchParams();
  const initialTypeParam = 'type' in routeParams ? String(routeParams.type) : undefined;
  const initialCategoryParam = 'category' in routeParams ? String(routeParams.category) : undefined;
  const initialAnimalIdParam = 'animalId' in routeParams ? String(routeParams.animalId) : undefined;
  const initialFeedIdParam = 'feedId' in routeParams ? String(routeParams.feedId) : undefined;
  
  const theme = useTheme();
  const styles = getStyles(theme);
  
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [showAnimalPicker, setShowAnimalPicker] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [feeds, setFeeds] = useState([]);
  const [showFeedPicker, setShowFeedPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [animalSearch, setAnimalSearch] = useState('');

  const incomeCategories = [
    { value: 'animal_sale', label: 'Hayvan Satışı', icon: 'trending-up' },
    { value: 'milk_sale', label: 'Süt Satışı', icon: 'droplet' },
    { value: 'egg_sale', label: 'Yumurta Satışı', icon: 'circle' },
    { value: 'manure_sale', label: 'Gübre Satışı', icon: 'package' },
    { value: 'other_income', label: 'Diğer Gelir', icon: 'plus' },
  ];

  const expenseCategories = [
    { value: 'animal_purchase', label: 'Hayvan Alımı', icon: 'shopping-cart' },
    { value: 'feed_purchase', label: 'Yem Alımı', icon: 'package' },
    { value: 'veterinary', label: 'Veteriner', icon: 'heart' },
    { value: 'medicine', label: 'İlaç', icon: 'plus-square' },
    { value: 'vaccination', label: 'Aşı', icon: 'shield' },
    { value: 'equipment', label: 'Ekipman', icon: 'tool' },
    { value: 'maintenance', label: 'Bakım', icon: 'settings' },
    { value: 'fuel', label: 'Yakıt', icon: 'zap' },
    { value: 'electricity', label: 'Elektrik', icon: 'zap' },
    { value: 'water', label: 'Su', icon: 'droplet' },
    { value: 'insurance', label: 'Sigorta', icon: 'shield' },
    { value: 'tax', label: 'Vergi', icon: 'file-text' },
    { value: 'labor', label: 'İşçilik', icon: 'users' },
    { value: 'other_expense', label: 'Diğer Gider', icon: 'minus' },
  ];

  useEffect(() => {
    loadAnimals();
    loadFeeds();
  }, []);

  useEffect(() => {
    if (initialAnimalIdParam && animals.length > 0) {
      const animal = animals.find(a => a.id === initialAnimalIdParam);
      if (animal) setSelectedAnimal(animal);
    }
  }, [initialAnimalIdParam, animals]);

  useEffect(() => {
    if (initialFeedIdParam && feeds.length > 0) {
      const feed = feeds.find(f => f.id === initialFeedIdParam);
      if (feed) setSelectedFeed(feed);
    }
  }, [initialFeedIdParam, feeds]);

  const loadAnimals = async () => {
    try {
      const animalsData = await animalsAPI.getAnimals();
      setAnimals(animalsData.filter(animal => animal.status === 'active'));
    } catch (error) {
      console.error('Load animals error:', error);
    }
  };

  const loadFeeds = async () => {
    try {
      const feedsData = await feedAPI.getFeeds();
      setFeeds(feedsData || []);
    } catch (error) {
      console.error('Load feeds error:', error);
    }
  };

  const getCurrentCategories = (type) => {
    return type === 'income' ? incomeCategories : expenseCategories;
  };

  const getCategoryLabel = (value, type) => {
    const categories = getCurrentCategories(type);
    const category = categories.find(cat => cat.value === value);
    return category ? category.label : 'Kategori seçin...';
  };

  const isAnimalRequired = (category) => ['animal_purchase', 'animal_sale'].includes(category);
  const isFeedRequired = (category) => ['feed_purchase'].includes(category);
  const isFeedPurchase = (category) => category === 'feed_purchase';

  const TransactionSchema = Yup.object().shape({
    type: Yup.string().oneOf(['income', 'expense']).required('İşlem türü zorunludur'),
    category: Yup.string().required('Kategori zorunludur'),
    date: Yup.mixed().required('Tarih zorunludur'),
    description: Yup.string().max(500).nullable(),
    animal_id: Yup.string().nullable().when('category', (cat, schema) =>
      ['animal_sale', 'animal_purchase'].includes(cat) ? schema.required('Hayvan seçimi zorunludur') : schema
    ),
    feed_id: Yup.string().nullable().when('category', (cat, schema) =>
      cat === 'feed_purchase' ? schema.required('Yem seçimi zorunludur') : schema
    ),
    quantity: Yup.number().nullable().when('category', (cat, schema) =>
      cat === 'feed_purchase' ? schema.typeError('Miktar sayı olmalı').required('Miktar zorunludur') : schema.nullable()
    ),
    unit_price: Yup.number().nullable().when('category', (cat, schema) =>
      cat === 'feed_purchase' ? schema.typeError('Birim fiyat sayı olmalı').required('Birim fiyat zorunludur') : schema.nullable()
    ),
    amount: Yup.number().nullable().when('category', (cat, schema) =>
      cat !== 'feed_purchase' ? schema.typeError('Tutar sayı olmalı').required('Tutar zorunludur') : schema.nullable()
    ),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    try {
      const isFeed = isFeedPurchase(values.category);
      const finalAmount = isFeed
        ? parseFloat(values.quantity) * parseFloat(values.unit_price)
        : parseFloat(values.amount);

      const isoDate = new Date(values.date).toISOString().split('T')[0];

      if (values.category === 'animal_sale' && values.animal_id) {
        await financialAPI.recordAnimalSale(values.animal_id, {
          amount: finalAmount,
          description: values.description?.trim() || '',
          date: isoDate,
        });
      } else {
        await financialAPI.recordTransaction({
          type: values.type,
          category: values.category,
          amount: finalAmount,
          description: values.description?.trim() || '',
          date: isoDate,
          animal_id: values.animal_id || null,
          feed_id: values.feed_id || null,
          quantity: values.quantity ? parseFloat(values.quantity) : null,
          unit_price: values.unit_price ? parseFloat(values.unit_price) : null,
        });
      }

      FlashMessageService.success('Başarılı', 'İşlem kaydedildi');
      setTimeout(() => router.back(), 600);
    } catch (error) {
      console.error('Create transaction error:', error);
      FlashMessageService.error('Hata', 'İşlem kaydedilirken hata oluştu: ' + error.message);
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  const initialValues = {
    type: initialTypeParam || 'expense',
    category: initialCategoryParam || '',
    amount: '',
    description: '',
    date: new Date(),
    animal_id: initialAnimalIdParam || null,
    feed_id: initialFeedIdParam || null,
    quantity: '',
    unit_price: '',
  };

  // Modal Components
  const CategoryPickerModal = ({ selectedType, selectedCategory, onSelect }) => (
    <Modal visible={showCategoryPicker} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Kategori Seç</Text>
            <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
              <Icon library="Feather" name="x" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.searchBar}>
            <Icon library="Feather" name="search" size={18} color={theme.colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Kategori ara..."
              placeholderTextColor={theme.colors.textMuted}
              value={categorySearch}
              onChangeText={setCategorySearch}
            />
          </View>
          <ScrollView style={styles.categoryList}>
            {getCurrentCategories(selectedType)
              .filter(c => c.label.toLowerCase().includes(categorySearch.toLowerCase()))
              .map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryItem,
                    selectedCategory === cat.value && styles.categoryItemSelected
                  ]}
                  onPress={() => {
                    onSelect(cat.value);
                    setShowCategoryPicker(false);
                    setCategorySearch('');
                  }}
                >
                  <View style={styles.categoryItemContent}>
                    <Icon 
                      library="Feather" 
                      name={cat.icon} 
                      size={20} 
                      color={selectedCategory === cat.value ? theme.colors.primary : theme.colors.textSecondary} 
                    />
                    <Text style={[
                      styles.categoryText,
                      selectedCategory === cat.value && styles.categoryTextSelected
                    ]}>
                      {cat.label}
                    </Text>
                  </View>
                  {selectedCategory === cat.value && (
                    <Icon library="Feather" name="check" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const AnimalPickerModal = ({ onSelect, currentAnimalId }) => (
    <Modal visible={showAnimalPicker} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Hayvan Seç</Text>
            <TouchableOpacity onPress={() => setShowAnimalPicker(false)}>
              <Icon library="Feather" name="x" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.searchBar}>
            <Icon library="Feather" name="search" size={18} color={theme.colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Küpe no / ad ara..."
              placeholderTextColor={theme.colors.textMuted}
              value={animalSearch}
              onChangeText={setAnimalSearch}
            />
          </View>
          <ScrollView style={styles.animalList}>
            {animals
              .filter(a =>
                `${a.tag_number} ${a.name ?? ''}`
                  .toLowerCase()
                  .includes(animalSearch.toLowerCase())
              )
              .map((animal) => (
                <TouchableOpacity
                  key={animal.id}
                  style={[
                    styles.animalItem,
                    (selectedAnimal?.id === animal.id || currentAnimalId === animal.id) && styles.animalItemSelected
                  ]}
                  onPress={() => {
                    setSelectedAnimal(animal);
                    onSelect(animal.id);
                    setShowAnimalPicker(false);
                    setAnimalSearch('');
                  }}
                >
                  <View>
                    <Text style={styles.animalTag}>{animal.tag_number}</Text>
                    <Text style={styles.animalName}>{animal.name || 'İsimsiz'}</Text>
                    <Text style={styles.animalSpecies}>{animal.species} - {animal.breed}</Text>
                  </View>
                  {(selectedAnimal?.id === animal.id || currentAnimalId === animal.id) && (
                    <Icon library="Feather" name="check" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const FeedPickerModal = ({ onSelect, currentFeedId }) => (
    <Modal visible={showFeedPicker} transparent={true} animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Yem Seç</Text>
            <TouchableOpacity onPress={() => setShowFeedPicker(false)}>
              <Icon library="Feather" name="x" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.feedList}>
            {feeds.map((feed) => (
              <TouchableOpacity
                key={feed.id}
                style={[
                  styles.feedItem,
                  (selectedFeed?.id === feed.id || currentFeedId === feed.id) && styles.feedItemSelected
                ]}
                onPress={() => {
                  setSelectedFeed(feed);
                  onSelect(feed.id);
                  setShowFeedPicker(false);
                }}
              >
                <Text style={styles.feedName}>{feed.feed_name}</Text>
                <Text style={styles.feedUnit}>Birim: {feed.unit || 'kg'}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <DetailHeader
        title="Yeni İşlem"
        subtitle="Finansal işlem ekle"
        emoji="💰"
        gradient={true}
      />

      <Formik
        initialValues={initialValues}
        validationSchema={TransactionSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, setFieldValue, handleSubmit, isSubmitting }) => (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Transaction Type */}
              <DetailSection
                title="İşlem Türü"
                icon={{ library: 'Feather', name: 'activity' }}
                showDivider={false}
              >
                <View style={styles.typeButtons}>
                  <TouchableOpacity
                    style={[styles.typeButton, values.type === 'income' && styles.typeButtonActive]}
                    onPress={() => {
                      setFieldValue('type', 'income');
                      setFieldValue('category', '');
                    }}
                  >
                    <Icon 
                      library="Feather" 
                      name="trending-up" 
                      size={20} 
                      color={values.type === 'income' ? theme.colors.primaryText : theme.colors.textSecondary} 
                    />
                    <Text style={[styles.typeButtonText, values.type === 'income' && styles.typeButtonTextActive]}>
                      Gelir
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.typeButton, values.type === 'expense' && styles.typeButtonActive]}
                    onPress={() => {
                      setFieldValue('type', 'expense');
                      setFieldValue('category', '');
                    }}
                  >
                    <Icon 
                      library="Feather" 
                      name="trending-down" 
                      size={20} 
                      color={values.type === 'expense' ? theme.colors.primaryText : theme.colors.textSecondary} 
                    />
                    <Text style={[styles.typeButtonText, values.type === 'expense' && styles.typeButtonTextActive]}>
                      Gider
                    </Text>
                  </TouchableOpacity>
                </View>
              </DetailSection>

              {/* Category */}
              <DetailSection
                title="Kategori"
                subtitle="İşlem kategorisi seçin"
                icon={{ library: 'Feather', name: 'grid' }}
              >
                <TouchableOpacity
                  style={styles.selector}
                  onPress={() => setShowCategoryPicker(true)}
                >
                  <Text style={[styles.selectorText, !values.category && styles.placeholder]}>
                    {getCategoryLabel(values.category, values.type)}
                  </Text>
                  <Icon library="Feather" name="chevron-down" size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
                {touched.category && errors.category && (
                  <Text style={styles.errorText}>{errors.category}</Text>
                )}
              </DetailSection>

              {/* Animal Selection (if required) */}
              {isAnimalRequired(values.category) && (
                <DetailSection
                  title="Hayvan Seçimi"
                  icon={{ library: 'MaterialCommunityIcons', name: 'cow' }}
                >
                  <TouchableOpacity
                    style={styles.selector}
                    onPress={() => setShowAnimalPicker(true)}
                  >
                    <Text style={[styles.selectorText, !selectedAnimal && styles.placeholder]}>
                      {selectedAnimal 
                        ? `${selectedAnimal.tag_number} - ${selectedAnimal.name || 'İsimsiz'}`
                        : 'Hayvan seçin...'}
                    </Text>
                    <Icon library="Feather" name="chevron-down" size={20} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                  {touched.animal_id && errors.animal_id && (
                    <Text style={styles.errorText}>{errors.animal_id}</Text>
                  )}
                </DetailSection>
              )}

              {/* Feed Selection (if required) */}
              {isFeedRequired(values.category) && (
                <DetailSection
                  title="Yem Seçimi"
                  icon={{ library: 'MaterialCommunityIcons', name: 'grain' }}
                >
                  <TouchableOpacity
                    style={styles.selector}
                    onPress={() => setShowFeedPicker(true)}
                  >
                    <Text style={[styles.selectorText, !selectedFeed && styles.placeholder]}>
                      {selectedFeed ? selectedFeed.feed_name : 'Yem seçin...'}
                    </Text>
                    <Icon library="Feather" name="chevron-down" size={20} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                  {touched.feed_id && errors.feed_id && (
                    <Text style={styles.errorText}>{errors.feed_id}</Text>
                  )}
                </DetailSection>
              )}

              {/* Feed Purchase Specific Fields */}
              {isFeedPurchase(values.category) && (
                <DetailSection
                  title="Miktar ve Fiyat"
                  subtitle="Yem alış detayları"
                  icon={{ library: 'Feather', name: 'calculator' }}
                >
                  <DetailTextInput 
                    name="quantity" 
                    label={`Miktar (${selectedFeed?.unit || 'kg'}) *`}
                    keyboardType="numeric"
                    prefixIcon={{ library: 'Feather', name: 'hash' }}
                    placeholder="0"
                  />
                  <DetailTextInput 
                    name="unit_price" 
                    label={`Birim Fiyat (₺/${selectedFeed?.unit || 'kg'}) *`}
                    keyboardType="numeric"
                    prefixIcon={{ library: 'Feather', name: 'dollar-sign' }}
                    placeholder="0.00"
                  />
                  {(values.quantity && values.unit_price) && (
                    <View style={styles.calculatedAmount}>
                      <Text style={styles.calculatedAmountLabel}>Toplam Tutar:</Text>
                      <Text style={styles.calculatedAmountValue}>
                        ₺{(Number(values.quantity) * Number(values.unit_price) || 0).toFixed(2)}
                      </Text>
                    </View>
                  )}
                </DetailSection>
              )}

              {/* Amount */}
              {!isFeedPurchase(values.category) && (
                <DetailSection
                  title="Tutar"
                  subtitle="İşlem tutarı"
                  icon={{ library: 'Feather', name: 'dollar-sign' }}
                >
                  <DetailTextInput 
                    name="amount" 
                    label="Tutar (₺) *"
                    keyboardType="numeric"
                    prefixIcon={{ library: 'Feather', name: 'dollar-sign' }}
                    placeholder="0.00"
                  />
                </DetailSection>
              )}

              {/* Date and Description */}
              <DetailSection
                title="Tarih ve Açıklama"
                subtitle="Ek bilgiler"
                icon={{ library: 'Feather', name: 'calendar' }}
                collapsible={true}
              >
                <FormikDatePickerField name="date" label="Tarih *" />
                <DetailTextInput 
                  name="description" 
                  label="Açıklama"
                  multiline 
                  numberOfLines={3}
                  placeholder="İsteğe bağlı açıklama..."
                  style={{ height: 80, textAlignVertical: 'top' }}
                />
              </DetailSection>

              {/* Action Buttons */}
              <View style={styles.actionSection}>
                <DetailButton
                  title={loading ? 'Kaydediliyor...' : 'İşlemi Kaydet'}
                  onPress={handleSubmit}
                  loading={isSubmitting || loading}
                  leadingIcon={{ library: 'Feather', name: 'save' }}
                  fullWidth
                  size="lg"
                />

                <DetailButton
                  title="İptal"
                  variant="outline"
                  onPress={() => router.back()}
                  leadingIcon={{ library: 'Feather', name: 'x' }}
                  fullWidth
                  style={{ marginTop: theme.spacing.md }}
                />
              </View>
            </ScrollView>

            {/* Modals */}
            <CategoryPickerModal
              selectedType={values.type}
              selectedCategory={values.category}
              onSelect={(val) => setFieldValue('category', val)}
            />
            <AnimalPickerModal
              currentAnimalId={values.animal_id}
              onSelect={(id) => setFieldValue('animal_id', id)}
            />
            <FeedPickerModal
              currentFeedId={values.feed_id}
              onSelect={(id) => setFieldValue('feed_id', id)}
            />
          </KeyboardAvoidingView>
        )}
      </Formik>
    </View>
  );
}

const getStyles = (theme) => {
  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: isTablet ? theme.spacing.xl : theme.spacing.md,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
      maxWidth: isTablet ? 800 : '100%',
      alignSelf: isTablet ? 'center' : 'stretch',
      width: '100%',
    },
    typeButtons: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    typeButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.spacing.radius.lg,
      backgroundColor: theme.colors.surface,
      borderWidth: 2,
      borderColor: 'transparent',
      gap: theme.spacing.sm,
    },
    typeButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    typeButtonText: {
      ...theme.typography.styles.button,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    typeButtonTextActive: {
      color: theme.colors.primaryText,
    },
    selector: {
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.spacing.radius.lg,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: 52,
    },
    selectorText: {
      ...theme.typography.styles.body,
      color: theme.colors.text,
      flex: 1,
    },
    placeholder: {
      color: theme.colors.textMuted,
    },
    errorText: {
      ...theme.typography.styles.caption,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    },
    calculatedAmount: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.spacing.radius.lg,
      marginTop: theme.spacing.md,
    },
    calculatedAmountLabel: {
      ...theme.typography.styles.body,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    calculatedAmountValue: {
      ...theme.typography.styles.h4,
      color: theme.colors.primary,
      fontWeight: '700',
    },
    actionSection: {
      paddingHorizontal: theme.spacing.sm,
      marginTop: theme.spacing.xl,
      maxWidth: isTablet ? 400 : '100%',
      alignSelf: 'center',
      width: '100%',
    },

    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.card,
      borderTopLeftRadius: theme.spacing.radius.xl,
      borderTopRightRadius: theme.spacing.radius.xl,
      maxHeight: '70%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalTitle: {
      ...theme.typography.styles.h3,
      color: theme.colors.text,
      fontWeight: '700',
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      gap: theme.spacing.sm,
    },
    searchInput: {
      flex: 1,
      ...theme.typography.styles.body,
      color: theme.colors.text,
      paddingVertical: theme.spacing.sm,
    },
    categoryList: {
      padding: theme.spacing.md,
    },
    categoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
      borderRadius: theme.spacing.radius.lg,
      marginBottom: theme.spacing.xs,
      backgroundColor: theme.colors.surface,
    },
    categoryItemSelected: {
      backgroundColor: theme.colors.primary + '15',
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    categoryItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    categoryText: {
      ...theme.typography.styles.body,
      color: theme.colors.text,
      fontWeight: '500',
    },
    categoryTextSelected: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    animalList: {
      padding: theme.spacing.md,
    },
    animalItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.spacing.radius.lg,
      marginBottom: theme.spacing.xs,
      backgroundColor: theme.colors.surface,
    },
    animalItemSelected: {
      backgroundColor: theme.colors.primary + '15',
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    animalTag: {
      ...theme.typography.styles.body,
      color: theme.colors.text,
      fontWeight: '600',
    },
    animalName: {
      ...theme.typography.styles.caption,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    animalSpecies: {
      ...theme.typography.styles.caption,
      color: theme.colors.textMuted,
      fontSize: 11,
      marginTop: 2,
    },
    feedList: {
      padding: theme.spacing.md,
    },
    feedItem: {
      padding: theme.spacing.md,
      borderRadius: theme.spacing.radius.lg,
      marginBottom: theme.spacing.xs,
      backgroundColor: theme.colors.surface,
    },
    feedItemSelected: {
      backgroundColor: theme.colors.primary + '15',
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    feedName: {
      ...theme.typography.styles.body,
      color: theme.colors.text,
      fontWeight: '600',
    },
    feedUnit: {
      ...theme.typography.styles.caption,
      color: theme.colors.textMuted,
      fontSize: 11,
      marginTop: 2,
    },
  });
};