import { colors } from "@/assets/color";
import { units, categories } from "@/utils/recipe";
import { useRecipeStore } from "@/stores/recipeStore";
import type { Ingredient, RootStackParamList } from "@/types";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const emptyIng: Ingredient = { name: "", quantity: null, unit: "" };

const CreateRecipeScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { createRecipe, loading } = useRecipeStore();

    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [instructions, setInstructions] = useState("");
    const [ingredients, setIngredients] = useState<Ingredient[]>([{ ...emptyIng }]);

    const addIngredient = () => setIngredients((prev) => [...prev, { ...emptyIng }]);

    const removeIngredient = (index: number) => {
        if (ingredients.length > 1) setIngredients((prev) => prev.filter((_, i) => i !== index));
    };

    const updateIngredient = (index: number, field: keyof Ingredient, value: string | null) => {
        setIngredients((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleSubmit = async () => {
        if (!name.trim() || !category || !instructions.trim()) {
            Alert.alert("Error", "Isi semua field yang wajib diisi!");
            return;
        }

        const validIngredients = ingredients.filter((i) => i.name.trim() !== "");
        if (validIngredients.length === 0) {
            Alert.alert("Error", "Isi minimal 1 bahan!");
            return;
        }

        const result = await createRecipe({
            name: name.trim(),
            category,
            description: description.trim(),
            instructions: instructions.trim(),
            ingredients: validIngredients,
        });

        if (!result) return;

        const recipe = Array.isArray(result.data) ? result.data[0] : result.data;
        Alert.alert("Berhasil", "Resep telah ditambah!", [
            { text: "OK", onPress: () => navigation.navigate("RecipeDetail", { recipeId: recipe.id }) },
        ]);
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
                <View style={styles.card}>
                    <Text style={styles.title}>Tambah Resep Baru</Text>

                    <Text style={styles.label}>Nama Resep *</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="e.g., Ayam Bakar, Nasi Goreng..."
                        placeholderTextColor={colors.textMuted}
                    />

                    <Text style={styles.label}>Kategori *</Text>
                    <View style={styles.pickerContainer}>
                        <Picker selectedValue={category} onValueChange={setCategory} style={styles.picker}>
                            <Picker.Item label="Pilih Kategori" value="" />
                            {categories.map((c) => (
                                <Picker.Item key={c} label={c} value={c} />
                            ))}
                        </Picker>
                    </View>

                    <Text style={styles.label}>Deskripsi</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Jelaskan deskripsi resep"
                        placeholderTextColor={colors.textMuted}
                        multiline
                        numberOfLines={3}
                    />

                    <Text style={styles.label}>Bahan *</Text>
                    {ingredients.map((ingredient, index) => (
                        <View key={index} style={styles.ingredientRow}>
                            <TextInput
                                style={[styles.input, styles.qtyInput]}
                                value={ingredient.quantity?.toString() ?? ""}
                                onChangeText={(text) => updateIngredient(index, "quantity", text || null)}
                                placeholder="Qty"
                                placeholderTextColor={colors.textMuted}
                                keyboardType="decimal-pad"
                            />
                            <View style={[styles.pickerContainer, styles.unitPicker]}>
                                <Picker
                                    selectedValue={ingredient.unit ?? ""}
                                    onValueChange={(value) => updateIngredient(index, "unit", value)}
                                    style={styles.picker}
                                >
                                    {units.map((u) => (
                                        <Picker.Item key={u.value} label={u.label} value={u.value} />
                                    ))}
                                </Picker>
                            </View>
                            <TextInput
                                style={[styles.input, styles.nameInput]}
                                value={ingredient.name}
                                onChangeText={(text) => updateIngredient(index, "name", text)}
                                placeholder="Nama Bahan"
                                placeholderTextColor={colors.textMuted}
                            />
                            {ingredients.length > 1 && (
                                <TouchableOpacity style={styles.removeButton} onPress={() => removeIngredient(index)}>
                                    <Text style={styles.removeButtonText}>✕</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
                        <Text style={styles.addButtonText}>+ Tambah Bahan</Text>
                    </TouchableOpacity>

                    <Text style={styles.label}>Instruksi *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={instructions}
                        onChangeText={setInstructions}
                        placeholder="1. Langkah pertama&#10;2. Langkah kedua..."
                        placeholderTextColor={colors.textMuted}
                        multiline
                        numberOfLines={6}
                    />

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.cancelButtonText}>Batal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.submitButton, loading && { opacity: 0.6 }]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            <Text style={styles.submitButtonText}>{loading ? "Mohon Tunggu..." : "Tambah Resep"}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    card: {
        backgroundColor: colors.surface,
        margin: 16,
        padding: 16,
        borderRadius: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.textPrimary,
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: colors.textSecondary,
        marginBottom: 8,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 0,
        fontSize: 14,
        marginBottom: 16,
        color: colors.textPrimary,
        backgroundColor: colors.inputBackground,
    },
    textArea: {
        height: undefined,
        minHeight: 100,
        paddingVertical: 12,
        textAlignVertical: "top",
    },
    pickerContainer: {
        height: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: colors.inputBackground,
        overflow: "hidden",
        justifyContent: "center",
    },
    picker: {
        height: 48,
        color: colors.textPrimary,
    },
    ingredientRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 12,
        alignItems: "center",
    },
    qtyInput: {
        width: 80,
        marginBottom: 0,
    },
    unitPicker: {
        width: 110,
        marginBottom: 0,
    },
    nameInput: {
        flex: 1,
        marginBottom: 0,
    },
    removeButton: {
        backgroundColor: colors.errorSoft,
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    removeButtonText: {
        color: colors.error,
        fontSize: 18,
        fontWeight: "bold",
    },
    addButton: {
        backgroundColor: colors.successSoft,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 16,
    },
    addButtonText: {
        color: colors.success,
        fontWeight: "600",
    },
    buttonContainer: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: colors.overlay,
    },
    cancelButtonText: {
        color: colors.textPrimary,
        fontWeight: "600",
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: colors.success,
    },
    submitButtonText: {
        color: colors.textInverse,
        fontWeight: "bold",
        fontSize: 16,
    },
});

export default CreateRecipeScreen;
