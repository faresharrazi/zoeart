import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { TextAlign } from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Button } from './button';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Image as ImageIcon,
  Link as LinkIcon,
  Palette,
  Type,
  Quote,
  Code,
  Undo,
  Redo
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/apiClient';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({ content, onChange, placeholder }: RichTextEditorProps) => {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
        allowBase64: true,
        inline: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color,
      TextStyle,
      FontFamily.configure({
        types: ['textStyle'],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
        placeholder: placeholder || 'Start writing...',
      },
    },
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    setUploadingImage(true);

    try {
      // Upload the image
      const response = await apiClient.uploadFile(file, 'article');
      
      if (response.success && response.file) {
        // Insert the uploaded image into the editor
        editor.chain().focus().setImage({ 
          src: `/api/files/${response.file.id}`,
          alt: response.file.originalName || 'Image',
          class: 'max-w-full h-auto rounded-lg'
        }).run();
        
        setShowImageDialog(false);
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const addLink = () => {
    if (linkUrl && editor) {
      if (linkText) {
        editor.chain().focus().insertContent(`<a href="${linkUrl}">${linkText}</a>`).run();
      } else {
        editor.chain().focus().setLink({ href: linkUrl }).run();
      }
      setLinkUrl('');
      setLinkText('');
      setShowLinkDialog(false);
    }
  };

  const addVideo = () => {
    const videoUrl = prompt('Enter YouTube URL or video URL:');
    if (videoUrl && editor) {
      let videoHtml = '';
      
      // Check if it's a YouTube URL
      if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
        const videoId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
        if (videoId) {
          // Use a safer approach - create a div with YouTube embed
          videoHtml = `<div class="youtube-embed" data-video-id="${videoId}" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background: #000; border-radius: 8px;">
            <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>`;
        }
      } else {
        // Regular video URL
        videoHtml = `<video src="${videoUrl}" controls class="max-w-full h-auto rounded-lg"></video>`;
      }
      
      if (videoHtml) {
        editor.chain().focus().insertContent(videoHtml).run();
      }
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Editor Styles */}
      <style jsx>{`
        .ProseMirror {
          padding: 1rem;
          min-height: 200px;
          outline: none;
        }
        .ProseMirror h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 1rem 0 0.5rem 0;
          line-height: 1.2;
        }
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.8rem 0 0.4rem 0;
          line-height: 1.3;
        }
        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.6rem 0 0.3rem 0;
          line-height: 1.4;
        }
        .ProseMirror ul {
          list-style-type: disc;
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        .ProseMirror li {
          margin: 0.25rem 0;
        }
        .ProseMirror p {
          margin: 0.5rem 0;
        }
        .ProseMirror strong {
          font-weight: bold;
        }
        .ProseMirror em {
          font-style: italic;
        }
        .ProseMirror u {
          text-decoration: underline;
        }
        .ProseMirror blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #6b7280;
        }
      `}</style>
      
      {/* Toolbar */}
      <div className="border-b border-gray-300 p-2 bg-gray-50 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-200' : ''}
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-200' : ''}
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'bg-gray-200' : ''}
        >
          <Underline className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Headings */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}
        >
          H1
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}
        >
          H2
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}
        >
          H3
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Lists */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
        >
          <ListOrdered className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Alignment */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}
        >
          <AlignRight className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200' : ''}
        >
          <AlignJustify className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Special Elements */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-gray-200' : ''}
        >
          <Quote className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Media */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowImageDialog(true)}
        >
          <ImageIcon className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLinkDialog(true)}
        >
          <LinkIcon className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={addVideo}
        >
          📹
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Undo/Redo */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Add Image</h3>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full p-2 border border-gray-300 rounded mb-2"
            />
            <p className="text-sm text-gray-600 mb-4">
              💡 Supported formats: JPG, PNG, GIF, WebP (max 10MB)
            </p>
            <div className="flex gap-2">
              {uploadingImage && (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">Uploading...</span>
                </div>
              )}
              <Button 
                variant="outline" 
                onClick={() => setShowImageDialog(false)}
                disabled={uploadingImage}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Add Link</h3>
            <input
              type="url"
              placeholder="Enter URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-2"
            />
            <input
              type="text"
              placeholder="Link text (optional)"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <div className="flex gap-2">
              <Button onClick={addLink} disabled={!linkUrl}>
                Add Link
              </Button>
              <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
