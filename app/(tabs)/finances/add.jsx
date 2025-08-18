import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Formik } from 'formik';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import { FlashMessageService } from '../../../components/common/FlashMessage';
import FormikDatePickerField from '../../../components/forms/FormikDatePickerField';
import { animalsAPI, feedAPI, financialAPI } from '../../../services/api';
import { useTheme } from '../../../themes/useTheme';

export default function AddFinancialTransactionScreen() {
  const routeParams = useLocalSearchParams();
  const initialTypeParam = 'type' in routeParams ? String(routeParams.type) : undefined;
  const initialCategoryParam = 'category' in routeParams ? String(routeParams.category) : undefined;
  const initialAnimalIdParam = 'animalId' in routeParams ? String(routeParams.animalId) : undefined;
  const initialFeedIdParam = 'feedId' in routeParams ? String(routeParams.feedId) : undefined;
  const theme = useTheme();
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [showAnimalPicker, setShowAnimalPicker] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [feeds, setFeeds] = useState([]);
  const [showFeedPicker, setShowFeedPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [loading, setLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [animalSearch, setAnimalSearch] = useState('');

  const styles = useMemo(() => createStyles(theme), [theme]);

  const incomeCategories = [
    { value: 'animal_sale', label: 'Hayvan Satışı' },
    { value: 'milk_sale', label: 'Süt Satışı' },
    { value: 'egg_sale', label: 'Yumurta Satışı' },
    { value: 'manure_sale', label: 'Gübre Satışı' },
    { value: 'other_income', label: 'Diğer Gelir' },
  ];

  const expenseCategories = [
    { value: 'animal_purchase', label: 'Hayvan Alımı' },
    { value: 'feed_purchase', label: 'Yem Alımı' },
    { value: 'veterinary', label: 'Veteriner' },
    { value: 'medicine', label: 'İlaç' },
    { value: 'vaccination', label: 'Aşı' },
    { value: 'equipment', label: 'Ekipman' },
    { value: 'maintenance', label: 'Bakım' },
    { value: 'fuel', label: 'Yakıt' },
    { value: 'electricity', label: 'Elektrik' },
    { value: 'water', label: 'Su' },
    { value: 'insurance', label: 'Sigorta' },
    { value: 'tax', label: 'Vergi' },
    { value: 'labor', label: 'İşçilik' },
    { value: 'other_expense', label: 'Diğer Gider' },
  ];

  useEffect(() => {
    loadAnimals();
    loadFeeds();
  }, []);

  useEffect(() => {
    // URL parametrelerinden geldiğinde seçili hayvanı ayarla
    if (initialAnimalIdParam && animals.length > 0) {
      const animal = animals.find(a => a.id === initialAnimalIdParam);
      if (animal) {
        setSelectedAnimal(animal);
      }
    }
  }, [initialAnimalIdParam, animals]);

  useEffect(() => {
    // URL parametrelerinden geldiğinde seçili yemi ayarla
    if (initialFeedIdParam && feeds.length > 0) {
      const feed = feeds.find(f => f.id === initialFeedIdParam);
      if (feed) {
        setSelectedFeed(feed);
      }
    }
  }, [initialFeedIdParam, feeds]);

  useEffect(() => {
    // Kategori değiştiğinde seçili item'ları sıfırla (parametreden gelmiyorsa)
    if (!initialAnimalIdParam) {
      setSelectedAnimal(null);
    }
    if (!initialFeedIdParam) {
      setSelectedFeed(null);
    }
  }, [initialAnimalIdParam, initialFeedIdParam]);

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

  // Input yardımcıları
  function getISODate(d) {
    return new Date(d).toISOString().split('T')[0];
  }

  // Formik + Yup şeması
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

  async function handleSubmit(values, { setSubmitting }) {
    setLoading(true);
    try {
      const isFeed = isFeedPurchase(values.category);
      const finalAmount = isFeed
        ? parseFloat(values.quantity) * parseFloat(values.unit_price)
        : parseFloat(values.amount);

      const isoDate = getISODate(values.date);

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
  }

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

  const CategoryPickerModal = ({ selectedType, selectedCategory, onSelect }) => (
    <Modal
      visible={showCategoryPicker}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Kategori Seç</Text>
            <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={theme.colors.textMuted} />
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
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === cat.value && styles.categoryTextSelected
                  ]}>
                    {cat.label}
                  </Text>
                  {selectedCategory === cat.value && (
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const AnimalPickerModal = ({ onSelect, currentAnimalId }) => (
    <Modal
      visible={showAnimalPicker}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Hayvan Seç</Text>
            <TouchableOpacity onPress={() => setShowAnimalPicker(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={theme.colors.textMuted} />
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
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const FeedPickerModal = ({ onSelect, currentFeedId }) => (
    <Modal
      visible={showFeedPicker}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Yem Seç</Text>
            <TouchableOpacity onPress={() => setShowFeedPicker(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Yeni İşlem</Text>
        <View style={{ width: 24 }} />
      </View>

      <Formik
        initialValues={initialValues}
        validationSchema={TransactionSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, setFieldValue, handleSubmit }) => (
          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Transaction Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>İşlem Türü</Text>
              <View style={styles.typeButtons}>
                <TouchableOpacity
                  style={[styles.typeButton, values.type === 'income' && styles.typeButtonActive]}
                  onPress={() => {
                    setFieldValue('type', 'income');
                    setFieldValue('category', '');
                  }}
                >
                  <Text style={[styles.typeButtonText, values.type === 'income' && styles.typeButtonTextActive]}>Gelir</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, values.type === 'expense' && styles.typeButtonActive]}
                  onPress={() => {
                    setFieldValue('type', 'expense');
                    setFieldValue('category', '');
                  }}
                >
                  <Text style={[styles.typeButtonText, values.type === 'expense' && styles.typeButtonTextActive]}>Gider</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Category */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Kategori *</Text>
              <TouchableOpacity
                style={styles.categorySelector}
                onPress={() => setShowCategoryPicker(true)}
              >
                <Text style={[styles.categorySelectorText, !values.category && styles.placeholder]}>
                  {getCategoryLabel(values.category, values.type)}
                </Text>
                <Ionicons name="chevron-down" size={20} color={theme.colors.textMuted} />
              </TouchableOpacity>
              {touched.category && errors.category && (
                <Text style={styles.helpText}>{errors.category}</Text>
              )}
            </View>

            {/* Animal Selection (if required) */}
            {isAnimalRequired(values.category) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hayvan *</Text>
                <TouchableOpacity
                  style={styles.animalSelector}
                  onPress={() => setShowAnimalPicker(true)}
                >
                  <Text style={[styles.animalSelectorText, !selectedAnimal && styles.placeholder]}>
                    {selectedAnimal 
                      ? `${selectedAnimal.tag_number} - ${selectedAnimal.name || 'İsimsiz'}`
                      : 'Hayvan seçin...'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
                {touched.animal_id && errors.animal_id && (
                  <Text style={styles.helpText}>{errors.animal_id}</Text>
                )}
              </View>
            )}

            {/* Feed Selection (if required) */}
            {isFeedRequired(values.category) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Yem *</Text>
                <TouchableOpacity
                  style={styles.feedSelector}
                  onPress={() => setShowFeedPicker(true)}
                >
                  <Text style={[styles.feedSelectorText, !selectedFeed && styles.placeholder]}>
                    {selectedFeed ? selectedFeed.feed_name : 'Yem seçin...'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={theme.colors.textMuted} />
                </TouchableOpacity>
                {touched.feed_id && errors.feed_id && (
                  <Text style={styles.helpText}>{errors.feed_id}</Text>
                )}
              </View>
            )}

            {/* Feed Purchase Specific Fields */}
            {isFeedPurchase(values.category) && (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Miktar ({selectedFeed?.unit || 'kg'}) *</Text>
                  <TextInput
                    style={styles.input}
                    value={values.quantity}
                    onChangeText={(t) => setFieldValue('quantity', t)}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Birim Fiyat (₺/{selectedFeed?.unit || 'kg'}) *</Text>
                  <TextInput
                    style={styles.input}
                    value={values.unit_price}
                    onChangeText={(t) => setFieldValue('unit_price', t)}
                    placeholder="0.00"
                    keyboardType="numeric"
                  />
                </View>
                {(values.quantity && values.unit_price) && (
                  <Text style={styles.helpText}>
                    Otomatik hesaplanan: {values.quantity} × {values.unit_price} = {Number(values.quantity) * Number(values.unit_price) || 0}
                  </Text>
                )}
              </>
            )}

            {/* Amount */}
            {!isFeedPurchase(values.category) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tutar (₺) *</Text>
                <TextInput
                  style={styles.input}
                  value={values.amount}
                  onChangeText={(t) => setFieldValue('amount', t)}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>
            )}

            {/* Date */}
            <View style={styles.section}>
              <FormikDatePickerField name="date" label="Tarih *" />
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Açıklama</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={values.description}
                onChangeText={(t) => setFieldValue('description', t)}
                placeholder="İsteğe bağlı açıklama..."
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Save Button - ScrollView içinde */}
            <View style={styles.saveButtonContainer}>
              <TouchableOpacity
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Category Picker Modal */}
            {showCategoryPicker && (
              <CategoryPickerModal
                selectedType={values.type}
                selectedCategory={values.category}
                onSelect={(val) => setFieldValue('category', val)}
              />
            )}
            {/* Animal Picker Modal */}
            {showAnimalPicker && (
              <AnimalPickerModal
                currentAnimalId={values.animal_id}
                onSelect={(id) => setFieldValue('animal_id', id)}
              />
            )}
            {/* Feed Picker Modal */}
            {showFeedPicker && (
              <FeedPickerModal
                currentFeedId={values.feed_id}
                onSelect={(id) => setFieldValue('feed_id', id)}
              />
            )}

            {/* Modallarda seçim eventleri */}
          </ScrollView>
        )}
      </Formik>

      {/* Modallar bileşen içinde render ediliyor */}
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 100, // Tab bar ve scroll için yeterli space
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  typeButtonTextActive: {
    color: theme.colors.primaryText,
  },

  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
  },
  inputReadonly: {
    backgroundColor: theme.colors.surface,
    color: theme.colors.textSecondary,
  },
  helpText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  animalSelector: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  animalSelectorText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  placeholder: {
    color: theme.colors.textMuted,
  },
  dateButton: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  saveButtonContainer: {
    backgroundColor: theme.colors.background,
    padding: 16,
    paddingBottom: 32, // Tab bar için extra space
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.textDisabled,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primaryText,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  animalList: {
    padding: 16,
  },
  animalItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: theme.colors.surface,
  },
  animalItemSelected: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  animalTag: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  animalName: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  animalSpecies: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  feedSelector: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedSelectorText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  feedList: {
    padding: 16,
  },
  feedItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: theme.colors.surface,
  },
  feedItemSelected: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  feedName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  feedUnit: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  categorySelector: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categorySelectorText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  categoryList: {
    padding: 16,
  },
  categoryItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: theme.colors.surface,
  },
  categoryItemSelected: {
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  categoryTextSelected: {
    color: theme.colors.primary,
  },
}); 