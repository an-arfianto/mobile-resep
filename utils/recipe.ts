import type { Ingredient } from "@/types";

export const units = [
    { label: "Pilih Satuan", value: "" },
    { label: "g (gram)", value: "g" },
    { label: "kg (kilogram)", value: "kg" },
    { label: "ml (mililiter)", value: "ml" },
    { label: "l (liter)", value: "l" },
    { label: "cup (cangkir)", value: "cup" },
    { label: "sdm (sendok makan)", value: "sdm" },
    { label: "sdt (sendok teh)", value: "sdt" },
    { label: "butir", value: "butir" },
    { label: "buah", value: "buah" },
    { label: "siung", value: "siung" },
    { label: "batang", value: "batang" },
    { label: "lembar", value: "lembar" },
    { label: "potong", value: "potong" },
    { label: "jumput", value: "jumput" },
    { label: "secukupnya", value: "secukupnya" },
];

export const categories = [
    "Masakan Utama",
    "Makanan Pembuka",
    "Makanan Penutup",
    "Salad",
    "Kue",
    "Sup",
    "Minuman",
    "Cemilan",
];

export function formatIngredient(ing: Ingredient): string {
    const parts: string[] = [];
    if (ing.quantity != null) parts.push(ing.quantity.toString());
    if (ing.unit != null && ing.unit.trim() !== "") parts.push(ing.unit);
    parts.push(ing.name);
    return parts.join(" ");
}

export function getIngredientsDisplay(ingredients: Ingredient[] | string | undefined): string {
    if (!ingredients) return "";
    if (typeof ingredients === "string") return ingredients;
    return ingredients.map(formatIngredient).join(", ");
}

export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}
