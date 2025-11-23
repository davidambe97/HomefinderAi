import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { useSearchStore } from '@/store/searchStore';

interface SearchFormProps {
  variant?: 'hero' | 'full';
}

const SearchForm = ({ variant = 'full' }: SearchFormProps) => {
  const navigate = useNavigate();
  const { filters, setFilters } = useSearchStore();
  const [localFilters, setLocalFilters] = useState(filters);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(localFilters);
    navigate('/results');
  };

  if (variant === 'hero') {
    return (
      <form onSubmit={handleSearch} className="relative group">
        <div className="flex gap-3 p-2 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 group-hover:shadow-blue-500/20 relative z-10">
          <Input
            placeholder="Enter city, state, or zip code..."
            value={localFilters.location || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, location: e.target.value })}
            className="flex-1 border-0 bg-transparent text-lg focus-visible:ring-0 focus-visible:ring-offset-0 px-4 placeholder:text-slate-400"
            autoFocus
            disabled={false}
          />
          <Button 
            type="submit" 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all hover:scale-105 px-8 rounded-xl"
          >
            <Search className="mr-2 h-5 w-5" />
            Search
          </Button>
        </div>
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-300 pointer-events-none" />
      </form>
    );
  }

  return (
    <form onSubmit={handleSearch} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="City, State, or ZIP"
            value={localFilters.location || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, location: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="propertyType">Property Type</Label>
          <Select
            value={localFilters.propertyType}
            onValueChange={(value) => setLocalFilters({ ...localFilters, propertyType: value })}
          >
            <SelectTrigger id="propertyType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="condo">Condo</SelectItem>
              <SelectItem value="townhouse">Townhouse</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="minPrice">Min Price</Label>
          <Input
            id="minPrice"
            type="number"
            placeholder="Min Price"
            value={localFilters.minPrice || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, minPrice: Number(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxPrice">Max Price</Label>
          <Input
            id="maxPrice"
            type="number"
            placeholder="Max Price"
            value={localFilters.maxPrice || ''}
            onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: Number(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Select
            value={localFilters.bedrooms.toString()}
            onValueChange={(value) => setLocalFilters({ ...localFilters, bedrooms: Number(value) })}
          >
            <SelectTrigger id="bedrooms">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
              <SelectItem value="5">5+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Select
            value={localFilters.bathrooms.toString()}
            onValueChange={(value) => setLocalFilters({ ...localFilters, bathrooms: Number(value) })}
          >
            <SelectTrigger id="bathrooms">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
        <Search className="mr-2 h-4 w-4" />
        Search Properties
      </Button>
    </form>
  );
};

export default SearchForm;
