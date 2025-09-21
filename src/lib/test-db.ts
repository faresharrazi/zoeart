import { supabase } from "./supabase";

export const testDatabaseConnection = async () => {
  try {
    console.log("Testing Supabase connection...");

    // Test basic connection
    const { data, error } = await supabase
      .from("artists")
      .select("count")
      .limit(1);

    if (error) {
      console.error("Database error:", error);
      return { success: false, error: error.message };
    }

    console.log("Database connection successful");
    return { success: true, data };
  } catch (err) {
    console.error("Connection error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
};

export const testArtistsQuery = async () => {
  try {
    console.log("Testing artists query...");

    const { data, error } = await supabase.from("artists").select("*").limit(5);

    if (error) {
      console.error("Artists query error:", error);
      return { success: false, error: error.message };
    }

    console.log("Artists query successful:", data);
    return { success: true, data };
  } catch (err) {
    console.error("Artists query error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
};

export const testStorageBucket = async () => {
  try {
    console.log("Testing storage bucket...");

    // First, try to list files in the bucket directly
    // This will work even if listBuckets() doesn't show the bucket
    const { data: files, error: filesError } = await supabase.storage
      .from("gallery-images")
      .list("", { limit: 1 });

    if (filesError) {
      console.error("Storage files error:", filesError);
      return {
        success: false,
        error: `Storage access error: ${filesError.message}`,
      };
    }

    console.log(
      "Storage bucket test successful - can access gallery-images bucket"
    );
    return { success: true, data: { files } };
  } catch (err) {
    console.error("Storage test error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown storage error",
    };
  }
};

export const testFileUpload = async () => {
  try {
    console.log("Testing file upload...");

    // Create a simple test file
    const testContent = "This is a test file for upload";
    const testFile = new File([testContent], "test.txt", {
      type: "text/plain",
    });

    const { data, error } = await supabase.storage
      .from("gallery-images")
      .upload("test/test-upload.txt", testFile);

    if (error) {
      console.error("File upload error:", error);
      return { success: false, error: `Upload error: ${error.message}` };
    }

    console.log("File upload successful:", data);

    // Clean up the test file
    await supabase.storage
      .from("gallery-images")
      .remove(["test/test-upload.txt"]);

    return { success: true, data };
  } catch (err) {
    console.error("File upload test error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown upload error",
    };
  }
};
