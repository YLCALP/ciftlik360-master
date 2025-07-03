import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
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
import { FlashMessageService } from '../../../components/common/FlashMessage';
import { animalsAPI, feedAPI, financialAPI } from '../../../services/api';
import { useTheme } from '../../../themes/useTheme';

export default function AddFinancialTransactionScreen() {
  const params = useLocalSearchParams();
  const theme = useTheme();
  const [transactionType, setTransactionType] = useState(params.type || 'expense'); // income, expense
  const [category, setCategory] = useState(params.category || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
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
    if (params.animalId && animals.length > 0) {
      const animal = animals.find(a => a.id === params.animalId);
      if (animal) {
        setSelectedAnimal(animal);
      }
    }
  }, [params.animalId, animals]);

  useEffect(() => {
    // URL parametrelerinden geldiğinde seçili yemi ayarla
    if (params.feedId && feeds.length > 0) {
      const feed = feeds.find(f => f.id === params.feedId);
      if (feed) {
        setSelectedFeed(feed);
      }
    }
  }, [params.feedId, feeds]);

  useEffect(() => {
    // Kategori değiştiğinde seçili item'ları sıfırla (parametreden gelmiyorsa)
    if (!params.animalId) {
      setSelectedAnimal(null);
    }
    if (!params.feedId) {
      setSelectedFeed(null);
    }
  }, [category, params.animalId, params.feedId]);

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

  const getCurrentCategories = () => {
    return transactionType === 'income' ? incomeCategories : expenseCategories;
  };

  const getCategoryLabel = (value) => {
    const categories = getCurrentCategories();
    const category = categories.find(cat => cat.value === value);
    return category ? category.label : 'Kategori seçin...';
  };

  const isAnimalRequired = () => {
    return ['animal_purchase', 'animal_sale'].includes(category);
  };

  const isFeedRequired = () => {
    return ['feed_purchase'].includes(category);
  };

  const isFeedPurchase = () => {
    return category === 'feed_purchase';
  };

  // Yem alımında toplam tutarı hesapla
  useEffect(() => {
    if (isFeedPurchase() && quantity && pricePerUnit) {
      const total = parseFloat(quantity) * parseFloat(pricePerUnit);
      if (!isNaN(total)) {
        setAmount(total.toString());
      }
    }
  }, [quantity, pricePerUnit, category]);

  const validateForm = () => {
    const { description, transaction_type, animal_id, feed_id, quantity, unit_price, amount } = formData;

    if (!description.trim() || !transaction_type) {
      FlashMessageService.error('Hata', 'Lütfen gerekli alanları doldurun');
      return false;
    }

    if (['yem_alimi', 'hayvan_satisi'].includes(transaction_type) && !animal_id) {
      FlashMessageService.error('Hata', 'Bu işlem türü için hayvan seçimi zorunludur');
      return false;
    }

    if (transaction_type === 'yem_alimi' && !feed_id) {
      FlashMessageService.error('Hata', 'Bu işlem türü için yem seçimi zorunludur');
      return false;
    }

    if (transaction_type === 'yem_alimi') {
      if (!quantity || !unit_price) {
        FlashMessageService.error('Hata', 'Yem alımı için miktar ve birim fiyat gereklidir');
        return false;
      }
      
      if (isNaN(parseFloat(quantity)) || isNaN(parseFloat(unit_price))) {
        FlashMessageService.error('Hata', 'Geçerli miktar ve birim fiyat girin');
        return false;
      }
    } else {
      if (!amount) {
        FlashMessageService.error('Hata', 'Tutar gereklidir');
        return false;
      }
      
      if (isNaN(parseFloat(amount))) {
        FlashMessageService.error('Hata', 'Geçerli bir tutar girin');
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      let finalAmount = 0;
      
      if (formData.transaction_type === 'yem_alimi') {
        finalAmount = parseFloat(formData.quantity) * parseFloat(formData.unit_price);
      } else {
        finalAmount = parseFloat(formData.amount);
      }

      const transactionData = {
        ...formData,
        amount: finalAmount,
        quantity: formData.quantity ? parseFloat(formData.quantity) : null,
        unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
        animal_id: formData.animal_id || null,
        feed_id: formData.feed_id || null,
      };

      await financialAPI.addTransaction(transactionData);
      
      FlashMessageService.success('Başarılı', 'İşlem kaydedildi');
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      console.error('Create transaction error:', error);
      FlashMessageService.error('Hata', 'İşlem kaydedilirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const CategoryPickerModal = () => (
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
          <ScrollView style={styles.categoryList}>
            {getCurrentCategories().map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryItem,
                  category === cat.value && styles.categoryItemSelected
                ]}
                onPress={() => {
                  setCategory(cat.value);
                  setShowCategoryPicker(false);
                }}
              >
                <Text style={[
                  styles.categoryText,
                  category === cat.value && styles.categoryTextSelected
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const AnimalPickerModal = () => (
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
          <ScrollView style={styles.animalList}>
            {animals.map((animal) => (
              <TouchableOpacity
                key={animal.id}
                style={[
                  styles.animalItem,
                  selectedAnimal?.id === animal.id && styles.animalItemSelected
                ]}
                onPress={() => {
                  setSelectedAnimal(animal);
                  setShowAnimalPicker(false);
                }}
              >
                <View>
                  <Text style={styles.animalTag}>{animal.tag_number}</Text>
                  <Text style={styles.animalName}>{animal.name || 'İsimsiz'}</Text>
                  <Text style={styles.animalSpecies}>{animal.species} - {animal.breed}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const FeedPickerModal = () => (
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
                  selectedFeed?.id === feed.id && styles.feedItemSelected
                ]}
                onPress={() => {
                  setSelectedFeed(feed);
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
              style={[
                styles.typeButton,
                transactionType === 'income' && styles.typeButtonActive
              ]}
              onPress={() => {
                setTransactionType('income');
                setCategory('');
              }}
            >
              <Text style={[
                styles.typeButtonText,
                transactionType === 'income' && styles.typeButtonTextActive
              ]}>
                Gelir
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                transactionType === 'expense' && styles.typeButtonActive
              ]}
              onPress={() => {
                setTransactionType('expense');
                setCategory('');
              }}
            >
              <Text style={[
                styles.typeButtonText,
                transactionType === 'expense' && styles.typeButtonTextActive
              ]}>
                Gider
              </Text>
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
            <Text style={[
              styles.categorySelectorText,
              !category && styles.placeholder
            ]}>
              {getCategoryLabel(category)}
            </Text>
            <Ionicons name="chevron-down" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Animal Selection (if required) */}
        {isAnimalRequired() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hayvan *</Text>
            <TouchableOpacity
              style={styles.animalSelector}
              onPress={() => setShowAnimalPicker(true)}
            >
              <Text style={[
                styles.animalSelectorText,
                !selectedAnimal && styles.placeholder
              ]}>
                {selectedAnimal 
                  ? `${selectedAnimal.tag_number} - ${selectedAnimal.name || 'İsimsiz'}`
                  : 'Hayvan seçin...'
                }
              </Text>
              <Ionicons name="chevron-down" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Feed Selection (if required) */}
        {isFeedRequired() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Yem *</Text>
            <TouchableOpacity
              style={styles.feedSelector}
              onPress={() => setShowFeedPicker(true)}
            >
              <Text style={[
                styles.feedSelectorText,
                !selectedFeed && styles.placeholder
              ]}>
                {selectedFeed ? selectedFeed.feed_name : 'Yem seçin...'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Feed Purchase Specific Fields */}
        {isFeedPurchase() && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Miktar ({selectedFeed?.unit || 'kg'}) *</Text>
              <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Birim Fiyat (₺/{selectedFeed?.unit || 'kg'}) *</Text>
              <TextInput
                style={styles.input}
                value={pricePerUnit}
                onChangeText={setPricePerUnit}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>
          </>
        )}

        {/* Amount */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isFeedPurchase() ? 'Toplam Tutar (₺)' : 'Tutar (₺) *'}
          </Text>
          <TextInput
            style={[styles.input, isFeedPurchase() && styles.inputReadonly]}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="numeric"
            editable={!isFeedPurchase()}
          />
          {isFeedPurchase() && (
            <Text style={styles.helpText}>
              Otomatik hesaplanan: {quantity} × {pricePerUnit} = {amount}
            </Text>
          )}
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tarih *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {date.toLocaleDateString('tr-TR')}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Açıklama</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="İsteğe bağlı açıklama..."
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Save Button - ScrollView içinde */}
        <View style={styles.saveButtonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {/* Category Picker Modal */}
      <CategoryPickerModal />

      {/* Animal Picker Modal */}
      <AnimalPickerModal />

      {/* Feed Picker Modal */}
      <FeedPickerModal />
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