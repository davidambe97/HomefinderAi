import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SearchForm from '@/components/SearchForm';
import { Card } from '@/components/ui/card';

const Search = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold md:text-4xl">Advanced Property Search</h1>
            <p className="text-muted-foreground">
              Use filters below to find your perfect home across all major real estate platforms
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <Card className="p-6">
              <SearchForm />
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              Searching across Zillow, Realtor.com, Redfin, and more...
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Search;
