import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Search, Download, Eye, ShoppingCart, User, TrendingUp, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_ADMIN || 'https://nitai-gems-backend.nitai-gems.workers.dev/admin';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [cartDialogOpen, setCartDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    usersWithCarts: 0,
    totalCartValue: 0
  });

  useEffect(() => {
    fetchUsersWithCarts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(user => 
        user.phone?.toLowerCase().includes(query) ||
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

 const fetchUsersWithCarts = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    
    const response = await fetch(`${API_BASE_URL}/users-with-carts`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success) {
      // Process users to ensure cart data is properly structured
      const processedUsers = data.data.map(user => {
        let cartItems = [];
        let itemCount = 0;
        let cartValue = 0;
        
        // Check if user has a cart and items
        if (user.cart && user.cart.items && user.cart.items.length > 0) {
          // Map cart items to standardized format
          cartItems = user.cart.items.map(item => ({
            id: item.id,
            productId: item.product_id,
            name: item.product_name || 'Unnamed Product',
            slug: item.product_slug || '',
            image: item.product_image || '',
            sku: item.sku,
            price: parseFloat(item.price) || 0,
            quantity: parseInt(item.quantity) || 1,
            subtotal: parseFloat(item.subtotal) || 0,
            metal: item.metal,
            metalPurity: item.metal_purity,
            stone: item.stone,
            stoneType: item.stone_type,
            addedAt: item.added_at,
            updatedAt: item.updated_at
          }));
          
          itemCount = cartItems.length;
          cartValue = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
        }
        
        return {
          id: user.user_id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          is_admin: user.is_admin,
          created_at: user.user_created_at,
          updated_at: user.user_updated_at,
          cart: user.cart,
          cartItems,
          itemCount,
          cartValue,
          hasCart: itemCount > 0
        };
      });
      
      setUsers(processedUsers);
      setFilteredUsers(processedUsers);
      
      // Calculate stats from the processed data
      const usersWithItems = processedUsers.filter(u => u.itemCount > 0).length;
      const totalValue = processedUsers.reduce((sum, u) => sum + (u.cartValue || 0), 0);
      
      setStats({
        totalUsers: processedUsers.length,
        activeUsers: usersWithItems,
        usersWithCarts: data.stats?.usersWithCarts || usersWithItems,
        totalCartValue: totalValue
      });
    } else {
      throw new Error(data.message || 'Failed to fetch users');
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    alert(`Error loading users: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

  const viewUserCart = (user) => {
    setSelectedUser(user);
    setCartDialogOpen(true);
  };

  const downloadExcel = () => {
    if (filteredUsers.length === 0) {
      alert('No users to download');
      return;
    }

    try {
      const excelData = filteredUsers.map(user => ({
        'Phone': user.phone || 'N/A',
        'Name': user.name || 'N/A',
        'Email': user.email || 'N/A',
        'Is Admin': user.is_admin === 1 ? 'Yes' : 'No',
        'Has Cart': user.hasCart ? 'Yes' : 'No',
        'Items in Cart': user.itemCount || 0,
        'Cart Value (₹)': user.cartValue ? user.cartValue.toFixed(2) : '0.00',
        'Registered': user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A',
        'Last Active': user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'
      }));

      // Create CSV content with proper escaping
      const headers = Object.keys(excelData[0]);
      const csvRows = [
        headers.join(','),
        ...excelData.map(row => 
          headers.map(header => {
            const value = String(row[header] || '');
            // Escape quotes and wrap in quotes if contains comma, quote, or newline
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ];

      const csvContent = csvRows.join('\n');
      const BOM = '\uFEFF'; // UTF-8 BOM for proper Excel encoding
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Create download link
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const timestamp = new Date().toISOString().split('T')[0];
      
      link.setAttribute('href', url);
      link.setAttribute('download', `nitai_gems_users_${timestamp}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      alert('Error creating download file. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return '₹0.00';
    return `₹${parseFloat(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
        <Button 
          onClick={downloadExcel} 
          className="gap-2" 
          disabled={filteredUsers.length === 0}
        >
          <Download className="h-4 w-4" />
          Download CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Carts</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.usersWithCarts}</div>
            <p className="text-xs text-muted-foreground mt-1">Users with cart items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users with Items</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Active shoppers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cart Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalCartValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">Potential revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by phone, name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Phone</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Cart Items</TableHead>
                  <TableHead className="text-right">Cart Value</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                        <p>No users found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.phone || 'N/A'}</TableCell>
                      <TableCell>{user.name || 'N/A'}</TableCell>
                      <TableCell className="text-sm">{user.email || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {user.is_admin === 1 && (
                            <Badge variant="destructive" className="text-xs">Admin</Badge>
                          )}
                          {user.hasCart && (
                            <Badge variant="secondary" className="text-xs">Has Cart</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {user.itemCount > 0 ? (
                          <Badge variant="outline">{user.itemCount}</Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(user.cartValue)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(user.created_at)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewUserCart(user)}
                          disabled={!user.hasCart || user.itemCount === 0}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Cart
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Cart Details Dialog */}
      <Dialog open={cartDialogOpen} onOpenChange={setCartDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cart Details</DialogTitle>
            <DialogDescription>
              {selectedUser?.name || selectedUser?.phone}'s shopping cart
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedUser.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedUser.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedUser.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Cart Value</p>
                  <p className="font-bold text-lg text-primary">
                    {formatCurrency(selectedUser.cartValue)}
                  </p>
                </div>
              </div>

              {/* Cart Items */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Cart Items ({selectedUser.itemCount})
                </h3>
                
                {selectedUser.cartItems && selectedUser.cartItems.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Details</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-center">Qty</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedUser.cartItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {item.image ? (
                                  <img 
                                    src={item.image} 
                                    alt={item.name || 'Product'}
                                    className="w-16 h-16 object-cover rounded border"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-16 h-16 bg-muted rounded border flex items-center justify-center">
                                    <ShoppingCart className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    SKU: {item.sku || 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1 text-sm">
                                <div className="flex gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {item.metal} {item.metalPurity}
                                  </Badge>
                                </div>
                                {item.stone && (
                                  <div className="flex gap-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {item.stone} {item.stoneType && `(${item.stoneType})`}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(item.price)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">{item.quantity}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(item.price * item.quantity)}
                            </TableCell>
                          </TableRow>
                        ))}
                        {/* Total Row */}
                        <TableRow className="bg-muted/50 font-bold">
                          <TableCell colSpan={4} className="text-right">
                            Total Cart Value:
                          </TableCell>
                          <TableCell className="text-right text-lg">
                            {formatCurrency(selectedUser.cartValue)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No items in cart</p>
                  </div>
                )}
              </div>

              {/* Cart Metadata */}
              {selectedUser.cart && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg text-sm">
                  <div>
                    <p className="text-muted-foreground">Cart Created</p>
                    <p className="font-medium">{formatDate(selectedUser.cart.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="font-medium">{formatDate(selectedUser.cart.updated_at)}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}