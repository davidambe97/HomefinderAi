import { Link } from 'react-router-dom';
import { ArrowRight, Search, TrendingUp, Shield, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SearchForm from '@/components/SearchForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-20 md:py-32">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="mb-6 text-5xl font-bold leading-tight md:text-7xl text-slate-800">
                Find Your Dream Home
                <span className="block mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
                  Across Every Platform
                </span>
              </h1>
              <p className="mb-10 text-lg text-slate-600 md:text-xl max-w-2xl mx-auto">
                Search millions of properties from Zillow, Realtor.com, and more - all in one place. 
                <span className="font-semibold text-slate-800"> Powered by AI</span> to help you find the perfect match.
              </p>

              <div className="mx-auto max-w-3xl mb-10">
                <SearchForm variant="hero" />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                <div className="flex items-center gap-3 px-6 py-3 glass-effect rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium text-slate-700 group-hover:text-slate-900">Verified Listings</span>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 glass-effect rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium text-slate-700 group-hover:text-slate-900">Real-Time Updates</span>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 glass-effect rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/30">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium text-slate-700 group-hover:text-slate-900">AI-Powered Matching</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold md:text-5xl text-slate-800">Why Choose HomeFinder AI?</h2>
              <p className="text-xl text-slate-600">
                The smartest way to search for your next home
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <Card className="glass-effect border-white/20 transition-all hover:shadow-2xl hover:scale-105 duration-300 group">
                <CardContent className="p-8">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/30 group-hover:shadow-2xl group-hover:shadow-blue-500/40 transition-all">
                    <Search className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-slate-800">Universal Search</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Search across all major real estate platforms in one place. No more switching between sites.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-effect border-white/20 transition-all hover:shadow-2xl hover:scale-105 duration-300 group">
                <CardContent className="p-8">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30 group-hover:shadow-2xl group-hover:shadow-indigo-500/40 transition-all">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-slate-800">AI Recommendations</h3>
                  <p className="text-slate-600 leading-relaxed">
                    Get personalized property suggestions based on your preferences and search history.
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-effect border-white/20 transition-all hover:shadow-2xl hover:scale-105 duration-300 group">
                <CardContent className="p-8">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-xl shadow-purple-500/30 group-hover:shadow-2xl group-hover:shadow-purple-500/40 transition-all">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-slate-800">Verified Data</h3>
                  <p className="text-slate-600 leading-relaxed">
                    All listings are verified and updated in real-time to ensure accuracy.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-24">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtLjU1Mi40NDgtMSAxLTFoMTRjLjU1MiAwIDEgLjQ0OCAxIDF2MTRjMCAuNTUyLS40NDggMS0xIDFIMzdjLS41NTIgMC0xLS40NDgtMS0xVjE2em0tMTYgMGMwLS41NTIuNDQ4LTEgMS0xaDE0Yy41NTIgMCAxIC40NDggMSAxdjE0YzAgLjU1Mi0uNDQ4IDEtMSAxSDIxYy0uNTUyIDAtMS0uNDQ4LTEtMVYxNnptMCAxNmMwLS41NTIuNDQ4LTEgMS0xaDE0Yy41NTIgMCAxIC40NDggMSAxdjE0YzAgLjU1Mi0uNDQ4IDEtMSAxSDIxYy0uNTUyIDAtMS0uNDQ4LTEtMVYzMnptMTYgMGMwLS41NTIuNDQ4LTEgMS0xaDE0Yy41NTIgMCAxIC40NDggMSAxdjE0YzAgLjU1Mi0uNDQ4IDEtMSAxSDM3Yy0uNTUyIDAtMS0uNDQ4LTEtMVYzMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl drop-shadow-lg">
              Ready to Find Your Dream Home?
            </h2>
            <p className="mb-10 text-xl text-white/90 max-w-2xl mx-auto">
              Join thousands of happy homebuyers who found their perfect property with us.
            </p>
            <Link to="/search">
              <Button size="lg" className="gap-2 bg-white text-blue-600 hover:bg-slate-50 shadow-2xl hover:scale-105 transition-all px-8 py-6 text-lg">
                Start Searching Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
