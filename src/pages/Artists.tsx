import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Instagram, Mail, Globe, Loader2 } from "lucide-react";
import { usePageDataFromDB } from "@/hooks/usePageDataFromDB";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";

const Artists = () => {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { pageData } = usePageDataFromDB();

  // Check if page is visible
  const isPageVisible = pageData.artists?.isVisible;

  // If page is not visible, redirect to home
  useEffect(() => {
    if (pageData && isPageVisible === false) {
      window.location.href = "/";
    }
  }, [pageData, isPageVisible]);

  // Don't render anything if page is not visible
  if (pageData && isPageVisible === false) {
    return null;
  }

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const data = await apiClient.getArtists();
        setArtists(data as any[]);
      } catch (error) {
        console.error("Error fetching artists:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  const handleArtistClick = (artistSlug: string) => {
    window.location.href = `/artist/${artistSlug}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <section className="pt-24 pb-16 bg-[#0f0f0f] relative">
          <div className="container mx-auto px-6 text-center relative z-10">
            <div className="max-w-4xl mx-auto my-24">
              <h1 className="text-5xl md:text-7xl text-white mb-6 drop-shadow-lg">
                {pageData.artists?.title || "Artists"}
              </h1>
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
                <span className="ml-2 text-white/95">Loading artists...</span>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-[#0f0f0f] relative">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto my-24">
            <h1 className="text-5xl md:text-7xl text-white mb-6 drop-shadow-lg">
              {pageData.artists?.title || "Artists"}
            </h1>
            <p className="text-xl text-white/95 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              {pageData.artists?.description || "Meet our talented artists"}
            </p>
          </div>
        </div>
      </section>

      {/* Artists Grid - Only show if there are artists */}
      {artists.length > 0 && (
        <section className="py-20 bg-theme-background">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {artists.map((artist, index) => (
                <Card
                  key={index}
                  className="group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden border-0 shadow-lg bg-white"
                  onClick={() => handleArtistClick(artist.slug)}
                >
                  {/* Artist Profile Section */}
                  <div className="relative p-8 text-center">
                    {/* Circular Profile Image */}
                    <div className="relative mb-6">
                      {artist.profile_image &&
                      artist.profile_image !== "null" &&
                      artist.profile_image !== "undefined" ? (
                        <div className="relative inline-block">
                          <img
                            src={artist.profile_image}
                            alt={artist.name}
                            className="w-32 h-32 rounded-full mx-auto object-cover shadow-lg border-4 border-white group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.nextElementSibling.style.display = "flex";
                            }}
                          />
                          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/10 to-transparent"></div>
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-full mx-auto bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center shadow-lg border-4 border-white">
                          <span className="text-4xl text-slate-600 font-semibold">
                            {artist.name?.charAt(0) || "A"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Artist Info */}
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-theme-primary transition-colors duration-300">
                        {artist.name}
                      </h3>
                      
                      {artist.specialty && (
                        <p className="text-lg text-gray-600 font-medium">
                          {artist.specialty}
                        </p>
                      )}
                      
                      {artist.bio && (
                        <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                          {artist.bio}
                        </p>
                      )}
                    </div>

                    {/* Social Media Icons */}
                    {artist.social_media && (
                      <div className="flex justify-center space-x-4 mt-6">
                        {artist.social_media.instagram && (
                          <a
                            href={`https://instagram.com/${artist.social_media.instagram.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-theme-primary hover:text-white flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                          </a>
                        )}
                        
                        {artist.social_media.website && (
                          <a
                            href={artist.social_media.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-theme-primary hover:text-white flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                            </svg>
                          </a>
                        )}
                        
                        {artist.social_media.email && (
                          <a
                            href={`mailto:${artist.social_media.email}`}
                            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-theme-primary hover:text-white flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Artists;
