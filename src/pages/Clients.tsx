/**
 * Client Management page for HomeFinder AI SaaS
 */

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getClients, addClient, updateClient, deleteClient, type Client, type AddClientRequest } from '@/lib/api/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Clients = () => {
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<AddClientRequest>({
    name: '',
    email: '',
    searchCriteria: {
      location: '',
      propertyType: '',
      minPrice: undefined,
      maxPrice: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchClients();
    }
  }, [isAuthenticated]);

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[Clients] Fetching clients');
      const data = await getClients();
      setClients(data);
      console.log('[Clients] Clients fetched:', data.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch clients';
      console.error('[Clients] Error:', errorMessage);
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingClient) {
        console.log('[Clients] Updating client:', editingClient.id);
        await updateClient(editingClient.id, formData);
        toast({
          title: 'Success',
          description: 'Client updated successfully',
        });
      } else {
        console.log('[Clients] Adding client:', formData.name);
        await addClient(formData);
        toast({
          title: 'Success',
          description: 'Client added successfully',
        });
      }
      
      setDialogOpen(false);
      resetForm();
      fetchClients();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Operation failed';
      console.error('[Clients] Error:', errorMessage);
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      console.log('[Clients] Deleting client:', id);
      await deleteClient(id);
      toast({
        title: 'Success',
        description: 'Client deleted successfully',
      });
      fetchClients();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete client';
      console.error('[Clients] Error:', errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      searchCriteria: client.searchCriteria,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      email: '',
      searchCriteria: {
        location: '',
        propertyType: '',
        minPrice: undefined,
        maxPrice: undefined,
        bedrooms: undefined,
        bathrooms: undefined,
      },
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert>
              <AlertDescription>Please log in to access client management.</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 bg-muted/30 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-2xl font-bold md:text-3xl">Client Management</h1>
              <p className="text-sm text-muted-foreground">
                Manage your clients and their search criteria
              </p>
            </div>
            
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Client
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
                  <DialogDescription>
                    {editingClient ? 'Update client information and search criteria' : 'Add a new client with their property search preferences'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="font-semibold">Search Criteria</h3>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location *</Label>
                        <Input
                          id="location"
                          value={formData.searchCriteria.location || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            searchCriteria: { ...formData.searchCriteria, location: e.target.value },
                          })}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="propertyType">Property Type</Label>
                        <Input
                          id="propertyType"
                          value={formData.searchCriteria.propertyType || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            searchCriteria: { ...formData.searchCriteria, propertyType: e.target.value },
                          })}
                          placeholder="house, flat, etc."
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="minPrice">Min Price</Label>
                        <Input
                          id="minPrice"
                          type="number"
                          value={formData.searchCriteria.minPrice || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            searchCriteria: { ...formData.searchCriteria, minPrice: e.target.value ? Number(e.target.value) : undefined },
                          })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="maxPrice">Max Price</Label>
                        <Input
                          id="maxPrice"
                          type="number"
                          value={formData.searchCriteria.maxPrice || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            searchCriteria: { ...formData.searchCriteria, maxPrice: e.target.value ? Number(e.target.value) : undefined },
                          })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bedrooms">Bedrooms</Label>
                        <Input
                          id="bedrooms"
                          type="number"
                          value={formData.searchCriteria.bedrooms || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            searchCriteria: { ...formData.searchCriteria, bedrooms: e.target.value ? Number(e.target.value) : undefined },
                          })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bathrooms">Bathrooms</Label>
                        <Input
                          id="bathrooms"
                          type="number"
                          value={formData.searchCriteria.bathrooms || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            searchCriteria: { ...formData.searchCriteria, bathrooms: e.target.value ? Number(e.target.value) : undefined },
                          })}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingClient ? 'Update Client' : 'Add Client'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : clients.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No clients found. Add your first client to get started.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Property Type</TableHead>
                      <TableHead>Price Range</TableHead>
                      <TableHead>Bedrooms</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>{client.searchCriteria.location || '-'}</TableCell>
                        <TableCell>{client.searchCriteria.propertyType || 'Any'}</TableCell>
                        <TableCell>
                          {client.searchCriteria.minPrice || client.searchCriteria.maxPrice
                            ? `£${(client.searchCriteria.minPrice || 0).toLocaleString()} - £${(client.searchCriteria.maxPrice || '∞').toLocaleString()}`
                            : '-'}
                        </TableCell>
                        <TableCell>{client.searchCriteria.bedrooms || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(client)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(client.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Clients;

