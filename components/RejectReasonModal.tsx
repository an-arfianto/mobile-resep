import { colors } from "@/assets/color";
import React, { useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface RejectReasonModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => Promise<void>;
    loading?: boolean;
}

const RejectReasonModal: React.FC<RejectReasonModalProps> = ({ visible, onClose, onConfirm, loading = false }) => {
    const [reason, setReason] = useState("");

    const handleClose = () => {
        setReason("");
        onClose();
    };

    const handleConfirm = async () => {
        await onConfirm(reason);
        setReason("");
    };

    return (
        <Modal visible={visible} transparent onRequestClose={handleClose}>
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={handleClose}>
                <TouchableOpacity style={styles.content} activeOpacity={1} onPress={() => {}}>
                    <Text style={styles.title}>Tolak Resep</Text>
                    <Text style={styles.subtitle}>Berikan alasan kenapa menolak resep tersebut!</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="e.g., bahan kurang lengkap, berisi hal yang buruk..."
                        placeholderTextColor={colors.textMuted}
                        value={reason}
                        onChangeText={setReason}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />

                    <View style={styles.buttons}>
                        <TouchableOpacity style={styles.cancelButton} onPress={handleClose} disabled={loading}>
                            <Text style={styles.cancelText}>Batal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.rejectButton, loading && { opacity: 0.6 }]}
                            onPress={handleConfirm}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.textInverse} />
                            ) : (
                                <Text style={styles.rejectText}>Tolak Resep</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    content: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: colors.textPrimary,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        backgroundColor: colors.inputBackground,
        color: colors.textPrimary,
        padding: 12,
        fontSize: 14,
        minHeight: 100,
        marginBottom: 20,
    },
    buttons: {
        flexDirection: "row",
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: colors.overlay,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    cancelText: {
        color: colors.textPrimary,
        fontWeight: "600",
        fontSize: 16,
    },
    rejectButton: {
        flex: 1,
        backgroundColor: colors.error,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    rejectText: {
        color: colors.textInverse,
        fontWeight: "600",
        fontSize: 16,
    },
});

export default RejectReasonModal;
