import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useArtists } from "@/hooks/use-artists";
import { useArtworks } from "@/hooks/use-artworks";
import { useExhibitions } from "@/hooks/use-exhibitions";
import {
  testDatabaseConnection,
  testArtistsQuery,
  testStorageBucket,
  testFileUpload,
} from "@/lib/test-db";

const DatabaseTest = () => {
  const {
    artists,
    loading: artistsLoading,
    error: artistsError,
  } = useArtists();
  const {
    artworks,
    loading: artworksLoading,
    error: artworksError,
  } = useArtworks();
  const {
    exhibitions,
    loading: exhibitionsLoading,
    error: exhibitionsError,
  } = useExhibitions();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${result}`,
    ]);
  };

  useEffect(() => {
    if (artists.length > 0) {
      addTestResult(`✅ Artists loaded: ${artists.length} artists`);
    }
    if (artistsError) {
      addTestResult(`❌ Artists error: ${artistsError}`);
    }
  }, [artists, artistsError]);

  useEffect(() => {
    if (artworks.length > 0) {
      addTestResult(`✅ Artworks loaded: ${artworks.length} artworks`);
    }
    if (artworksError) {
      addTestResult(`❌ Artworks error: ${artworksError}`);
    }
  }, [artworks, artworksError]);

  useEffect(() => {
    if (exhibitions.length > 0) {
      addTestResult(`✅ Exhibitions loaded: ${exhibitions.length} exhibitions`);
    }
    if (exhibitionsError) {
      addTestResult(`❌ Exhibitions error: ${exhibitionsError}`);
    }
  }, [exhibitions, exhibitionsError]);

  const testConnection = async () => {
    setTestResults([]);
    addTestResult("🔄 Testing database connection...");

    try {
      // Test basic connection
      const connectionResult = await testDatabaseConnection();
      if (connectionResult.success) {
        addTestResult("✅ Database connection successful");
      } else {
        addTestResult(
          `❌ Database connection failed: ${connectionResult.error}`
        );
      }

      // Test artists query
      const artistsResult = await testArtistsQuery();
      if (artistsResult.success) {
        addTestResult(
          `✅ Artists query successful: ${
            artistsResult.data?.length || 0
          } records`
        );
      } else {
        addTestResult(`❌ Artists query failed: ${artistsResult.error}`);
      }

      // Test storage bucket
      const storageResult = await testStorageBucket();
      if (storageResult.success) {
        addTestResult(`✅ Storage bucket test successful`);
      } else {
        addTestResult(`❌ Storage bucket test failed: ${storageResult.error}`);
      }

      // Test file upload
      const uploadResult = await testFileUpload();
      if (uploadResult.success) {
        addTestResult(`✅ File upload test successful`);
      } else {
        addTestResult(`❌ File upload test failed: ${uploadResult.error}`);
      }
    } catch (error) {
      addTestResult(
        `❌ Test error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Database Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={testConnection}
            className="bg-gallery-gold hover:bg-gallery-gold/90"
          >
            Test Database Connection
          </Button>

          <div className="space-y-2">
            <h3 className="font-semibold">Environment Variables:</h3>
            <p>
              Supabase URL:{" "}
              {import.meta.env.VITE_SUPABASE_URL ? "✅ Set" : "❌ Missing"}
            </p>
            <p>
              Supabase Key:{" "}
              {import.meta.env.VITE_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Loading States:</h3>
            <p>Artists: {artistsLoading ? "⏳ Loading..." : "✅ Loaded"}</p>
            <p>Artworks: {artworksLoading ? "⏳ Loading..." : "✅ Loaded"}</p>
            <p>
              Exhibitions: {exhibitionsLoading ? "⏳ Loading..." : "✅ Loaded"}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Data Counts:</h3>
            <p>Artists: {artists.length}</p>
            <p>Artworks: {artworks.length}</p>
            <p>Exhibitions: {exhibitions.length}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Test Results:</h3>
            <div className="bg-gray-100 p-4 rounded max-h-40 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500">
                  No test results yet. Click "Test Database Connection" to
                  start.
                </p>
              ) : (
                testResults.map((result, index) => (
                  <p key={index} className="text-sm font-mono">
                    {result}
                  </p>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Sample Data:</h3>
            {artists.length > 0 && (
              <div>
                <p className="font-medium">First Artist:</p>
                <p className="text-sm text-gray-600">
                  {artists[0].name} - {artists[0].specialty}
                </p>
              </div>
            )}
            {artworks.length > 0 && (
              <div>
                <p className="font-medium">First Artwork:</p>
                <p className="text-sm text-gray-600">
                  {artworks[0].title} by{" "}
                  {artworks[0].artists?.name || "Unknown"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseTest;
