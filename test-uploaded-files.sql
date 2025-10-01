-- Test query for uploaded_files table without file_data column
-- This should work even if file_data column has issues

SELECT
  "id",
  "original_name",
  "filename",
  "file_path",
  "file_size",
  "mime_type",
  "category",
  "uploaded_by",
  "created_at"
FROM
  "uploaded_files"
ORDER BY
  "uploaded_files"."id"
LIMIT 50;
