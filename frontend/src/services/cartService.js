const API_BASE_URL = 'http://localhost:8081/api/cart';

export const cartService = {
    async getCart(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch cart');
            const data = await response.json();
            // Map backend CartItem to frontend expected format if needed
            const items = data.map(item => ({
                id: item.productId || item.id, // Fallback to id if productId is missing
                name: item.name,
                price: item.price,
                imageUrl: item.imageUrl,
                quantity: item.quantity
            }));

            // Deduplicate items by product ID to prevent UI key crashes
            const uniqueItems = [];
            const seenIds = new Set();
            
            for (const item of items) {
                if (!seenIds.has(item.id)) {
                    uniqueItems.push(item);
                    seenIds.add(item.id);
                } else {
                    const existing = uniqueItems.find(i => i.id === item.id);
                    if (existing) {
                        existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
                    }
                }
            }
            
            return uniqueItems;
        } catch (error) {
            console.error('Error fetching cart:', error);
            return [];
        }
    },

    async saveItem(userId, item) {
        try {
            const productId = item.id || item._id; // Handle both frontend and menu item ID names
            if (!productId) {
                console.error('Cannot save item without an ID:', item);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: productId,
                    name: item.name,
                    price: item.price,
                    imageUrl: item.imageUrl,
                    quantity: item.quantity
                })
            });
            if (!response.ok) throw new Error('Failed to save item');
            return await response.json();
        } catch (error) {
            console.error('Error saving item:', error);
        }
    },

    async removeItem(userId, productId) {
        try {
            if (!productId) {
                console.error('Cannot remove item without a productId');
                return;
            }
            const response = await fetch(`${API_BASE_URL}/${userId}/${productId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to remove item');
        } catch (error) {
            console.error('Error removing item:', error);
        }
    },

    async clearCart(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/${userId}/clear`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to clear cart');
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    }
};
