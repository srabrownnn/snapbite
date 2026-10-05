'use client';

import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { SnapBiteStore } from "@/lib/store/demo-store";
import { MenuItem, Category, AddOn, Restaurant } from "@/types/database";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Sparkles,
  Clock,
  Flame,
  Check,
  X,
  Layers,
  Image as ImageIcon,
  Tag,
} from "lucide-react";

export default function AdminMenuPage() {
  const [restaurant, setRestaurant] = useState<Restaurant>(SnapBiteStore.getRestaurant());
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [addons, setAddons] = useState<AddOn[]>([]);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");

  const [isAddonModalOpen, setIsAddonModalOpen] = useState(false);
  const [newAddonName, setNewAddonName] = useState("");
  const [newAddonPrice, setNewAddonPrice] = useState(30);

  // Form State for Food Item
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    price: 250,
    description: "",
    imageUrl: "",
    preparationTime: 15,
    calories: 500,
    isAvailable: true,
    isFeatured: false,
    selectedAddonIds: [] as string[],
  });

  const loadData = () => {
    const currentRest = SnapBiteStore.getRestaurant();
    setRestaurant(currentRest);
    setCategories(SnapBiteStore.getCategories(currentRest.id));
    setMenuItems(SnapBiteStore.getMenuItems(currentRest.id));
    setAddons(SnapBiteStore.getAddons(currentRest.id));
  };

  useEffect(() => {
    loadData();
    window.addEventListener("snapbite_store_updated", loadData);
    return () => window.removeEventListener("snapbite_store_updated", loadData);
  }, []);

  const openAddItemModal = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      categoryId: categories[0]?.id || "",
      price: 250,
      description: "",
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
      preparationTime: 15,
      calories: 500,
      isAvailable: true,
      isFeatured: false,
      selectedAddonIds: [],
    });
    setIsItemModalOpen(true);
  };

  const openEditItemModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      categoryId: item.category_id || "",
      price: item.price,
      description: item.description || "",
      imageUrl: item.image_url || "",
      preparationTime: item.preparation_time || 15,
      calories: item.calories || 500,
      isAvailable: item.is_available,
      isFeatured: item.is_featured,
      selectedAddonIds: item.add_ons ? item.add_ons.map((a) => a.id) : [],
    });
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const chosenAddons = addons.filter((a) => formData.selectedAddonIds.includes(a.id));

    if (editingItem) {
      SnapBiteStore.updateMenuItem(editingItem.id, {
        name: formData.name,
        category_id: formData.categoryId || null,
        price: Number(formData.price),
        description: formData.description,
        image_url: formData.imageUrl,
        preparation_time: Number(formData.preparationTime),
        calories: Number(formData.calories) || null,
        is_available: formData.isAvailable,
        is_featured: formData.isFeatured,
        add_ons: chosenAddons,
      });
    } else {
      SnapBiteStore.addMenuItem({
        restaurant_id: restaurant.id,
        category_id: formData.categoryId || null,
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        image_url: formData.imageUrl,
        preparation_time: Number(formData.preparationTime),
        calories: Number(formData.calories) || null,
        is_available: formData.isAvailable,
        is_featured: formData.isFeatured,
        display_order: menuItems.length + 1,
        add_ons: chosenAddons,
      });
    }

    setIsItemModalOpen(false);
    loadData();
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from the menu?`)) {
      SnapBiteStore.deleteMenuItem(id);
      loadData();
    }
  };

  const handleToggleAvailability = (item: MenuItem) => {
    SnapBiteStore.updateMenuItem(item.id, { is_available: !item.is_available });
    loadData();
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    SnapBiteStore.addCategory(restaurant.id, newCategoryName.trim(), newCategoryDesc.trim());
    setNewCategoryName("");
    setNewCategoryDesc("");
    setIsCategoryModalOpen(false);
    loadData();
  };

  const handleAddAddon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddonName.trim()) return;
    SnapBiteStore.addAddon(restaurant.id, newAddonName.trim(), Number(newAddonPrice));
    setNewAddonName("");
    setNewAddonPrice(30);
    setIsAddonModalOpen(false);
    loadData();
  };

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    const matchesCat =
      selectedCategoryTab === "all"
        ? true
        : selectedCategoryTab === "featured"
        ? item.is_featured
        : item.category_id === selectedCategoryTab;

    const matchesSearch =
      searchQuery.trim() === ""
        ? true
        : item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCat && matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Menu Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Add foods, adjust prices, toggle stock availability, and manage categories.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all text-slate-700"
            >
              <Layers className="w-4 h-4 text-orange-600" />
              <span>Categories</span>
            </button>

            <button
              onClick={() => setIsAddonModalOpen(true)}
              className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all text-slate-700"
            >
              <Tag className="w-4 h-4 text-orange-600" />
              <span>Add-ons</span>
            </button>

            <button
              onClick={openAddItemModal}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-600/20 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Food Item</span>
            </button>
          </div>
        </div>

        {/* Filter Navigation & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedCategoryTab("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategoryTab === "all"
                    ? "bg-orange-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All Foods ({menuItems.length})
              </button>

              <button
                onClick={() => setSelectedCategoryTab("featured")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategoryTab === "featured"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                }`}
              >
                Popular ({menuItems.filter((i) => i.is_featured).length})
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryTab(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategoryTab === cat.id
                      ? "bg-orange-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat.name} ({menuItems.filter((i) => i.category_id === cat.id).length})
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search food item..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-4 shadow-sm flex flex-col justify-between transition-all ${
                !item.is_available ? "border-red-200 bg-red-50/20" : "border-slate-200 hover:border-orange-300"
              }`}
            >
              <div>
                {/* Photo & Status Header */}
                <div className="relative h-44 rounded-xl overflow-hidden bg-slate-100 mb-3">
                  <img
                    src={item.image_url || ""}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {item.is_featured && (
                    <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow">
                      Popular
                    </span>
                  )}

                  {/* Availability Badge */}
                  <span
                    className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold shadow ${
                      item.is_available
                        ? "bg-emerald-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {item.is_available ? "In Stock" : "Sold Out"}
                  </span>
                </div>

                {/* Details */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-extrabold text-slate-900 text-base">{item.name}</h3>
                  <span className="font-black text-orange-600 text-base shrink-0">
                    {formatCurrency(item.price, restaurant.currency)}
                  </span>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                  {item.description || "No description provided."}
                </p>

                {/* Add-ons tag preview */}
                {item.add_ons && item.add_ons.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {item.add_ons.map((a) => (
                      <span
                        key={a.id}
                        className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                      >
                        +{a.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Controls */}
              <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between gap-2">
                {/* Stock Toggle */}
                <button
                  onClick={() => handleToggleAvailability(item)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    item.is_available
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                      : "bg-red-50 text-red-700 border-red-300 hover:bg-red-100"
                  }`}
                >
                  {item.is_available ? "✓ Available" : "✗ Unavailable"}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditItemModal(item)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    title="Edit Item"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id, item.name)}
                    className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                    title="Delete Item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add / Edit Food Item Modal */}
        {isItemModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-xl font-black text-slate-900">
                  {editingItem ? "Edit Food Item" : "Create New Food Item"}
                </h3>
                <button
                  onClick={() => setIsItemModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dish Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Signature Truffle Burger"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Category</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Price ({restaurant.currency})
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={1}
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Fresh ingredients, toppings, style..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Prep Time (mins)</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.preparationTime}
                      onChange={(e) =>
                        setFormData({ ...formData, preparationTime: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Calories (kcal)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.calories}
                      onChange={(e) =>
                        setFormData({ ...formData, calories: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
                    />
                  </div>
                </div>

                {/* Add-ons selection */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">
                    Attach Add-ons (Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {addons.map((a) => {
                      const isChecked = formData.selectedAddonIds.includes(a.id);
                      return (
                        <label
                          key={a.id}
                          className="flex items-center gap-2 p-1.5 bg-white rounded-lg border border-slate-200 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  selectedAddonIds: [...formData.selectedAddonIds, a.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  selectedAddonIds: formData.selectedAddonIds.filter(
                                    (id) => id !== a.id
                                  ),
                                });
                              }
                            }}
                            className="rounded text-orange-600 focus:ring-orange-500"
                          />
                          <span className="font-medium text-slate-800">{a.name}</span>
                          <span className="text-slate-400">
                            (+{formatCurrency(a.price, restaurant.currency)})
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.isAvailable}
                      onChange={(e) =>
                        setFormData({ ...formData, isAvailable: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-orange-600"
                    />
                    <span>Available in Stock</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) =>
                        setFormData({ ...formData, isFeatured: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-orange-600"
                    />
                    <span>Mark as Popular / Featured</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsItemModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-md shadow-orange-600/20"
                  >
                    Save Dish
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Category Modal */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-black text-slate-900">Add Menu Category</h3>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddCategory} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category Name</label>
                  <input
                    type="text"
                    required
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g. Seafood, Sandwiches, Mocktails..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Description</label>
                  <input
                    type="text"
                    value={newCategoryDesc}
                    onChange={(e) => setNewCategoryDesc(e.target.value)}
                    placeholder="Short description..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCategoryModalOpen(false)}
                    className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold"
                  >
                    Create Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Addon Modal */}
        {isAddonModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-lg font-black text-slate-900">Add Menu Add-on</h3>
                <button
                  onClick={() => setIsAddonModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddAddon} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Add-on Name</label>
                  <input
                    type="text"
                    required
                    value={newAddonName}
                    onChange={(e) => setNewAddonName(e.target.value)}
                    placeholder="e.g. Extra Avocado, Garlic Sauce..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Price ({restaurant.currency})
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newAddonPrice}
                    onChange={(e) => setNewAddonPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-500/30 outline-none"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddonModalOpen(false)}
                    className="px-4 py-2 border rounded-xl text-slate-600 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold"
                  >
                    Add Add-on
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
