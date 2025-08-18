import AsyncStorage from '@react-native-async-storage/async-storage';
import { FlashMessageService } from '../components/common/FlashMessage';

const NOTIFICATIONS_STORAGE_KEY = 'automation_notifications';
const NOTIFICATION_SETTINGS_KEY = 'notification_settings';

class NotificationService {
  constructor() {
    this.listeners = [];
    this.settings = {
      enableLowStockAlerts: true,
      enableAutomationAlerts: true,
      enableFailureAlerts: true,
      alertThreshold: 5 // days
    };
  }

  // Ayarları yükle
  async loadSettings() {
    try {
      const settingsJson = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (settingsJson) {
        this.settings = { ...this.settings, ...JSON.parse(settingsJson) };
      }
    } catch (error) {
      console.error('Load notification settings error:', error);
    }
  }

  // Ayarları kaydet
  async saveSettings(newSettings) {
    try {
      this.settings = { ...this.settings, ...newSettings };
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(this.settings));
      this.notifyListeners({ type: 'SETTINGS_UPDATED', settings: this.settings });
    } catch (error) {
      console.error('Save notification settings error:', error);
      throw error;
    }
  }

  // Bildirim gönder
  async sendNotification(type, title, message, data = {}) {
    const notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      data,
      timestamp: new Date().toISOString(),
      read: false
    };

    try {
      // Bildirimi kaydet
      await this.storeNotification(notification);

      // Ayarlara göre göster
      if (this.shouldShowNotification(type)) {
        this.showFlashMessage(type, title, message);
      }

      // Listener'ları bilgilendir
      this.notifyListeners({
        type: 'NOTIFICATION_RECEIVED',
        notification
      });

      return notification;
    } catch (error) {
      console.error('Send notification error:', error);
      throw error;
    }
  }

  // Bildirimin gösterilip gösterilmeyeceğini kontrol et
  shouldShowNotification(type) {
    switch (type) {
      case 'LOW_STOCK':
        return this.settings.enableLowStockAlerts;
      case 'AUTOMATION_SUCCESS':
      case 'AUTOMATION_WARNING':
        return this.settings.enableAutomationAlerts;
      case 'AUTOMATION_FAILURE':
        return this.settings.enableFailureAlerts;
      default:
        return true;
    }
  }

  // Flash message göster
  showFlashMessage(type, title, message) {
    switch (type) {
      case 'LOW_STOCK':
        FlashMessageService.warning(title, message);
        break;
      case 'AUTOMATION_SUCCESS':
        FlashMessageService.success(title, message);
        break;
      case 'AUTOMATION_WARNING':
        FlashMessageService.warning(title, message);
        break;
      case 'AUTOMATION_FAILURE':
        FlashMessageService.error(title, message);
        break;
      default:
        FlashMessageService.info(title, message);
        break;
    }
  }

  // Bildirimi kaydet
  async storeNotification(notification) {
    try {
      const storedNotificationsJson = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      const storedNotifications = storedNotificationsJson ? JSON.parse(storedNotificationsJson) : [];
      
      // Yeni bildirimi başa ekle
      storedNotifications.unshift(notification);
      
      // Son 100 bildirimi sakla
      const limitedNotifications = storedNotifications.slice(0, 100);
      
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(limitedNotifications));
    } catch (error) {
      console.error('Store notification error:', error);
    }
  }

  // Bildirimleri getir
  async getNotifications(limit = 50) {
    try {
      const notificationsJson = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      const notifications = notificationsJson ? JSON.parse(notificationsJson) : [];
      return notifications.slice(0, limit);
    } catch (error) {
      console.error('Get notifications error:', error);
      return [];
    }
  }

  // Okunmamış bildirim sayısını getir
  async getUnreadCount() {
    try {
      const notifications = await this.getNotifications();
      return notifications.filter(n => !n.read).length;
    } catch (error) {
      console.error('Get unread count error:', error);
      return 0;
    }
  }

  // Bildirimi okundu olarak işaretle
  async markAsRead(notificationId) {
    try {
      const notificationsJson = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      const notifications = notificationsJson ? JSON.parse(notificationsJson) : [];
      
      const updatedNotifications = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
      
      this.notifyListeners({
        type: 'NOTIFICATION_READ',
        notificationId
      });
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  }

  // Tüm bildirimleri okundu olarak işaretle
  async markAllAsRead() {
    try {
      const notificationsJson = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      const notifications = notificationsJson ? JSON.parse(notificationsJson) : [];
      
      const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
      
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
      
      this.notifyListeners({
        type: 'ALL_NOTIFICATIONS_READ'
      });
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  }

  // Bildirimleri temizle
  async clearNotifications() {
    try {
      await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
      this.notifyListeners({
        type: 'NOTIFICATIONS_CLEARED'
      });
    } catch (error) {
      console.error('Clear notifications error:', error);
    }
  }

  // Otomasyon başarı bildirimi
  async notifyAutomationSuccess(processedRecords, totalConsumption) {
    return await this.sendNotification(
      'AUTOMATION_SUCCESS',
      'Otomatik Tüketim Tamamlandı',
      `${processedRecords} kayıt işlendi, toplam ${totalConsumption.toFixed(1)} kg yem tüketildi.`,
      { processedRecords, totalConsumption }
    );
  }

  // Otomasyon uyarı bildirimi
  async notifyAutomationWarning(warnings) {
    const warningText = warnings.slice(0, 2).join('\n');
    return await this.sendNotification(
      'AUTOMATION_WARNING',
      'Otomasyon Uyarıları',
      `${warnings.length} uyarı: ${warningText}${warnings.length > 2 ? '...' : ''}`,
      { warnings }
    );
  }

  // Otomasyon hata bildirimi
  async notifyAutomationFailure(error) {
    return await this.sendNotification(
      'AUTOMATION_FAILURE',
      'Otomatik Tüketim Başarısız',
      `Hata: ${error}`,
      { error }
    );
  }

  // Düşük stok bildirimi
  async notifyLowStock(feedName, remainingStock, unit) {
    return await this.sendNotification(
      'LOW_STOCK',
      'Düşük Stok Uyarısı',
      `${feedName}: ${remainingStock} ${unit} kaldı`,
      { feedName, remainingStock, unit }
    );
  }

  // Stok tükendi bildirimi
  async notifyStockEmpty(feedName) {
    return await this.sendNotification(
      'LOW_STOCK',
      'Stok Tükendi',
      `${feedName} stoku tükendi!`,
      { feedName, empty: true }
    );
  }

  // Otomasyon durumu kontrol et ve bildirim gönder
  async checkAutomationStatus(automationStatus) {
    if (!automationStatus.automation?.enabled) return;

    const lastRun = automationStatus.lastAutomationDate;
    if (!lastRun) return;

    const lastRunDate = new Date(lastRun);
    const now = new Date();
    const daysSinceLastRun = Math.floor((now - lastRunDate) / (1000 * 60 * 60 * 24));

    if (daysSinceLastRun >= this.settings.alertThreshold) {
      await this.sendNotification(
        'AUTOMATION_WARNING',
        'Otomasyon Uzun Süredir Çalışmadı',
        `Son çalışma: ${daysSinceLastRun} gün önce. Kontrol edin.`,
        { daysSinceLastRun }
      );
    }
  }

  // Event listener ekle
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Listener'ları bilgilendir
  notifyListeners(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Notification listener error:', error);
      }
    });
  }

  // Ayarları getir
  getSettings() {
    return { ...this.settings };
  }

  // Debug info
  async getDebugInfo() {
    const notifications = await this.getNotifications(10);
    const unreadCount = await this.getUnreadCount();
    
    return {
      settings: this.settings,
      totalNotifications: notifications.length,
      unreadCount,
      recentNotifications: notifications.slice(0, 5)
    };
  }
}

// Singleton instance
export const notificationService = new NotificationService();

// Export class for testing
export { NotificationService };