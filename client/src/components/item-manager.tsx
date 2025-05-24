import { useState } from "react";
import { Keyboard, List, Trash2, Plus, Fan, Download } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import type { WheelItem } from "@shared/schema";
import { 
  useWheelItems, 
  useAddWheelItem, 
  useDeleteWheelItem, 
  useClearWheelItems,
  useSpinStats 
} from "@/hooks/use-wheel-items";

const addItemSchema = z.object({
  text: z.string().min(1, "Item text is required").max(20, "Item text too long"),
});

type AddItemFormData = z.infer<typeof addItemSchema>;

const colors = [
  "#FF1493", // Pink
  "#00FFFF", // Cyan
  "#FFB000", // Orange
  "#00FF41", // Green
  "#9400D3", // Purple
  "#FF6347", // Tomato
  "#FFD700", // Gold
  "#1E90FF", // Dodger Blue
  "#FF4500", // Orange Red
  "#00CED1", // Dark Turquoise
  "#ADFF2F", // Green Yellow
  "#FF69B4", // Hot Pink
  "#8A2BE2", // Blue Violet
  "#20B2AA", // Light Sea Green
  "#FFA500", // Orange
  "#7FFF00", // Chartreuse
  "#DC143C", // Crimson
  "#00BFFF", // Deep Sky Blue
  "#FF8C00", // Dark Orange
  "#32CD32"  // Lime Green
];

export default function ItemManager() {
  const { toast } = useToast();
  const { data: items = [], isLoading } = useWheelItems();
  const { data: stats } = useSpinStats();
  const addItem = useAddWheelItem();
  const deleteItem = useDeleteWheelItem();
  const clearItems = useClearWheelItems();

  const form = useForm<AddItemFormData>({
    resolver: zodResolver(addItemSchema),
    defaultValues: {
      text: "",
    },
  });

  const onSubmit = async (data: AddItemFormData) => {
    const color = colors[items.length % colors.length];
    try {
      await addItem.mutateAsync({
        text: data.text.toUpperCase(),
        color,
        order: items.length,
      });
      form.reset();
      toast({
        title: "Item Added",
        description: `${data.text.toUpperCase()} has been added to the wheel.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleQuickAdd = async (itemText: string) => {
    if (items.some(item => item.text === itemText)) {
      toast({
        title: "Item Already Exists",
        description: `${itemText} is already in the wheel.`,
        variant: "destructive",
      });
      return;
    }

    const color = colors[items.length % colors.length];
    try {
      await addItem.mutateAsync({
        text: itemText,
        color,
        order: items.length,
      });
      toast({
        title: "Item Added",
        description: `${itemText} has been added to the wheel.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number, text: string) => {
    try {
      await deleteItem.mutateAsync(id);
      toast({
        title: "Item Removed",
        description: `${text} has been removed from the wheel.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Clear all items? This action cannot be undone.')) {
      try {
        await clearItems.mutateAsync();
        toast({
          title: "All Items Cleared",
          description: "The wheel has been cleared of all items.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to clear items. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleLoadPreset = async () => {
    const presetItems = ["OPTION A", "OPTION B", "OPTION C", "OPTION D"];
    try {
      await clearItems.mutateAsync();
      for (let i = 0; i < presetItems.length; i++) {
        const color = colors[i % colors.length];
        await addItem.mutateAsync({
          text: presetItems[i],
          color,
          order: i,
        });
      }
      toast({
        title: "Preset Loaded",
        description: "Default options have been loaded into the wheel.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load preset. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="terminal-border bg-crt-gray p-6">
          <div className="text-terminal-green">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Items */}
      <div className="terminal-border bg-crt-gray p-6">
        <div className="flex items-center mb-4">
          <Keyboard className="text-terminal-green mr-3" size={20} />
          <h3 className="text-lg font-retro text-terminal-green">INPUT MANAGER</h3>
        </div>
        
        <div className="space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm text-terminal-amber mb-2">ENTER NEW ITEM:</label>
                <div className="flex space-x-2">
                  <FormField
                    control={form.control}
                    name="text"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Type item name..."
                            className="input-terminal flex-1 px-3 py-2 placeholder-gray-500"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={addItem.isPending}
                    className="retro-button px-4 py-2 text-terminal-green hover:text-terminal-cyan"
                  >
                    <Plus size={16} />
                  </Button>
                </div>
              </div>
            </form>
          </Form>
          
          {/* Quick Add Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {/* {quickAddItems.map(item => (
              <button
                key={item}
                onClick={() => handleQuickAdd(item)}
                disabled={addItem.isPending || items.some(existing => existing.text === item)}
                className="retro-button px-3 py-2 text-xs text-terminal-green hover:text-terminal-cyan disabled:opacity-50"
              >
                + {item}
              </button>
            ))} */}
          </div>
        </div>
      </div>
      
      {/* Current Items List */}
      <div className="terminal-border bg-crt-gray p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <List className="text-terminal-green mr-3" size={20} />
            <h3 className="text-lg font-retro text-terminal-green">ACTIVE ITEMS</h3>
          </div>
          <div className="text-sm text-terminal-amber">
            COUNT: <span>{items.length}</span>
          </div>
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center justify-between bg-black p-3 border border-terminal-green">
              <div className="flex items-center space-x-3">
                <span className="text-terminal-cyan font-mono text-sm">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div 
                  className="w-4 h-4 rounded border border-terminal-green"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-terminal-green">{item.text}</span>
              </div>
              <button
                onClick={() => handleDelete(item.id, item.text)}
                disabled={deleteItem.isPending}
                className="text-terminal-pink hover:text-red-400 transition-colors disabled:opacity-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center text-terminal-amber py-8">
              NO ITEMS ADDED
            </div>
          )}
        </div>
        
        {/* Bulk Actions */}
        <div className="flex space-x-2 mt-4">
          <button
            onClick={handleClearAll}
            disabled={clearItems.isPending || items.length === 0}
            className="retro-button flex-1 py-2 text-terminal-amber hover:text-terminal-cyan text-sm disabled:opacity-50"
          >
            <Fan size={16} className="inline mr-2" />
            CLEAR ALL
          </button>
          <button
            onClick={handleLoadPreset}
            disabled={addItem.isPending}
            className="retro-button flex-1 py-2 text-terminal-amber hover:text-terminal-cyan text-sm disabled:opacity-50"
          >
            <Download size={16} className="inline mr-2" />
            LOAD PRESET
          </button>
        </div>
      </div>
      
      {/* Statistics Panel */}
      <div className="terminal-border bg-crt-gray p-6">
        <div className="flex items-center mb-4">
          <i className="fas fa-chart-bar text-terminal-green mr-3"></i>
          <h3 className="text-lg font-retro text-terminal-green">SYSTEM STATS</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-black p-3 border border-terminal-green">
            <div className="text-terminal-amber">TOTAL SPINS:</div>
            <div className="text-terminal-cyan font-retro text-lg">
              {stats?.totalSpins || 0}
            </div>
          </div>
          <div className="bg-black p-3 border border-terminal-green">
            <div className="text-terminal-amber">LAST WINNER:</div>
            <div className="text-terminal-cyan font-retro text-lg">
              {stats?.lastWinner || 'NONE'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
