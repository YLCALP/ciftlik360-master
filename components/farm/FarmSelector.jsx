import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Icon } from '../common/Icon';
import { useFarm } from '../../contexts/FarmContext';
import { useTheme } from '../../themes';

export function FarmSelector({ style }) {
    const { activeFarm, userFarms, switchToFarm, userRole, loading } = useFarm();
    const [showModal, setShowModal] = useState(false);
    const theme = useTheme();
    const styles = getStyles(theme);

    // Sadece bir çiftlik varsa seçici gösterme
    if (userFarms.length <= 1) {
        return null;
    }

    const getRoleColor = (role) => {
        switch (role) {
            case 'owner': return theme.colors.success;
            case 'manager': return theme.colors.primary;
            case 'employee': return theme.colors.warning;
            case 'viewer': return theme.colors.textMuted;
            default: return theme.colors.textSecondary;
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'owner': return 'Sahip';
            case 'manager': return 'Yönetici';
            case 'employee': return 'Çalışan';
            case 'viewer': return 'Görüntüleyici';
            default: return role;
        }
    };

    const handleFarmSelect = async (farm) => {
        setShowModal(false);
        if (farm.id !== activeFarm?.id) {
            await switchToFarm(farm);
        }
    };

    if (loading || !activeFarm) {
        return (
            <View style={[styles.selectorButton, style]}>
                <Text style={styles.selectorText}>Yükleniyor...</Text>
                <Icon library="Feather" name="chevron-down" size={16} color={theme.colors.textMuted} />
            </View>
        );
    }

    return (
        <>
            <TouchableOpacity 
                style={[styles.selectorButton, style]} 
                onPress={() => setShowModal(true)}
                activeOpacity={0.8}
            >
                <View style={styles.selectorContent}>
                    <Text style={styles.selectorText} numberOfLines={1}>
                        {activeFarm.farm_name}
                    </Text>
                    <View style={styles.roleContainer}>
                        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(userRole) + '20' }]}>
                            <Text style={[styles.roleText, { color: getRoleColor(userRole) }]}>
                                {getRoleLabel(userRole)}
                            </Text>
                        </View>
                    </View>
                </View>
                <Icon library="Feather" name="chevron-down" size={16} color={theme.colors.textMuted} />
            </TouchableOpacity>

            <Modal
                visible={showModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Çiftlik Seç</Text>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <Icon library="Feather" name="x" size={24} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.farmList} showsVerticalScrollIndicator={false}>
                            {userFarms.map((farm) => (
                                <TouchableOpacity
                                    key={farm.id}
                                    style={[
                                        styles.farmItem,
                                        activeFarm?.id === farm.id && styles.farmItemActive
                                    ]}
                                    onPress={() => handleFarmSelect(farm)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.farmItemContent}>
                                        <View style={styles.farmInfo}>
                                            <Text style={[
                                                styles.farmName,
                                                activeFarm?.id === farm.id && styles.farmNameActive
                                            ]}>
                                                {farm.farm_name}
                                            </Text>
                                            {farm.owner_name && (
                                                <Text style={styles.farmOwner}>
                                                    {farm.owner_name}
                                                </Text>
                                            )}
                                            {farm.city && (
                                                <Text style={styles.farmLocation}>
                                                    📍 {farm.city}
                                                </Text>
                                            )}
                                        </View>
                                        
                                        <View style={styles.farmMeta}>
                                            <View style={[
                                                styles.roleBadge, 
                                                { backgroundColor: getRoleColor(farm.user_role) + '20' }
                                            ]}>
                                                <Text style={[
                                                    styles.roleText, 
                                                    { color: getRoleColor(farm.user_role) }
                                                ]}>
                                                    {getRoleLabel(farm.user_role)}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    {activeFarm?.id === farm.id && (
                                        <View style={styles.activeIndicator}>
                                            <Icon 
                                                library="Feather" 
                                                name="check-circle" 
                                                size={20} 
                                                color={theme.colors.success} 
                                            />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <Text style={styles.footerText}>
                                {userFarms.length} çiftlik mevcut
                            </Text>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const getStyles = (theme) => StyleSheet.create({
    selectorButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.card,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.spacing.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        minHeight: 44,
    },
    selectorContent: {
        flex: 1,
        marginRight: theme.spacing.sm,
    },
    selectorText: {
        ...theme.typography.styles.bodyLarge,
        color: theme.colors.text,
        fontWeight: '600',
        marginBottom: 2,
    },
    roleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    roleBadge: {
        paddingHorizontal: theme.spacing.xs,
        paddingVertical: 2,
        borderRadius: theme.spacing.radius.sm,
    },
    roleText: {
        ...theme.typography.styles.caption,
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
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
        maxHeight: '80%',
        minHeight: '50%',
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
    farmList: {
        flex: 1,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },
    farmItem: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.spacing.radius.lg,
        padding: theme.spacing.md,
        marginVertical: theme.spacing.xs,
        borderWidth: 1,
        borderColor: theme.colors.border,
        flexDirection: 'row',
        alignItems: 'center',
    },
    farmItemActive: {
        borderColor: theme.colors.success,
        backgroundColor: theme.colors.success + '10',
    },
    farmItemContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    farmInfo: {
        flex: 1,
    },
    farmName: {
        ...theme.typography.styles.bodyLarge,
        color: theme.colors.text,
        fontWeight: '600',
        marginBottom: 2,
    },
    farmNameActive: {
        color: theme.colors.success,
    },
    farmOwner: {
        ...theme.typography.styles.caption,
        color: theme.colors.textSecondary,
        marginBottom: 2,
    },
    farmLocation: {
        ...theme.typography.styles.caption,
        color: theme.colors.textMuted,
        fontSize: 11,
    },
    farmMeta: {
        alignItems: 'flex-end',
        marginLeft: theme.spacing.md,
    },
    activeIndicator: {
        marginLeft: theme.spacing.sm,
    },
    modalFooter: {
        padding: theme.spacing.lg,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        alignItems: 'center',
    },
    footerText: {
        ...theme.typography.styles.caption,
        color: theme.colors.textMuted,
    },
});

FarmSelector.displayName = 'FarmSelector';