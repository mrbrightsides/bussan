import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Image as ImageIcon, Sparkles, Pin, CheckCircle2, Upload } from 'lucide-react';
import { CommunityPost, PostCategory } from '../types';
import { compressImageFile } from '../utils/mediaUtils';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: CommunityPost) => void;
  postToEdit?: CommunityPost | null;
}

const CATEGORIES: PostCategory[] = [
  'Berita Warga',
  'Liputan 17an & Kegiatan',
  'Pengumuman RT',
  'Kerja Bakti',
  'Iuran & Kas',
  'Keamanan & Ronda',
  'Kesehatan & Posyandu',
  'Sosial & Warga',
  'Umum',
];

export const PostModal: React.FC<PostModalProps> = ({
  isOpen,
  onClose,
  onSave,
  postToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>('Berita Warga');
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('Warga Green Bussan');
  const [isPinned, setIsPinned] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (postToEdit) {
        setTitle(postToEdit.title || '');
        setContent(postToEdit.content || '');
        setCategory(postToEdit.category || 'Berita Warga');
        setAuthorName(postToEdit.authorName || '');
        setAuthorRole(postToEdit.authorRole || 'Warga Green Bussan');
        setIsPinned(postToEdit.isPinned || false);
        setTagsInput(postToEdit.tags?.join(', ') || '');
        setImagePreview(postToEdit.images?.[0] || null);
      } else {
        setTitle('');
        setContent('');
        setCategory('Berita Warga');
        setAuthorName('');
        setAuthorRole('Warga Green Bussan');
        setIsPinned(false);
        setTagsInput('');
        setImagePreview(null);
      }
      setCompressionInfo(null);
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen, postToEdit]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    setCompressionInfo(null);
    const originalKb = Math.round(file.size / 1024);

    try {
      const compressedDataUrl = await compressImageFile(file, 960, 960, 0.72);
      setImagePreview(compressedDataUrl);
      const compressedKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);
      setCompressionInfo(`Foto dioptimalkan: ${originalKb} KB ➔ ${compressedKb} KB (Hemat kuota)`);
    } catch (err) {
      console.error(err);
      alert('Gagal mengompres gambar.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert('Mohon isi judul dan isi berita / pengumuman.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const postData: CommunityPost = {
      id: postToEdit?.id || `post-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      category,
      authorName: authorName.trim() || 'Warga Komplek',
      authorRole: authorRole.trim() || 'Green Bussan Village',
      date: postToEdit?.date || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      createdAt: postToEdit?.createdAt || new Date().toISOString(),
      isPinned,
      images: imagePreview ? [imagePreview] : undefined,
      likes: postToEdit?.likes || 0,
      tags: tags.length > 0 ? tags : undefined,
    };

    onSave(postData);
    onClose();
  };

  return (
    <div
      id="post-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-7 border border-slate-200 relative my-8 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-sm">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {postToEdit ? 'Edit Berita / Pengumuman' : 'Tulis Berita / Pengumuman Warga'}
              </h2>
              <p className="text-xs text-slate-500">
                Bagikan liputan kegiatan 17an, kabar gembira warga, atau pengumuman lingkungan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category & Pin Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kategori Berita / Kabar
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PostCategory)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium shadow-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 sm:pt-4">
              <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 hover:bg-emerald-50/50 transition-colors">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
                />
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  Sematkan (Pin)
                </span>
              </label>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Judul Berita / Kabar Warga <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Liputan Keseruan Final Turnamen Gaple & Pesta Rakyat 17an"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold shadow-sm"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Isi Cerita / Narasi Berita <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Tuliskan cerita liputan kegiatan, pengalaman seru lomba 17an, kabar gembira warga, atau detail pengumuman RT..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed shadow-sm"
            />
          </div>

          {/* Image Attachment with Auto Compression */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Lampirkan Foto Dokumentasi / Kegiatan (Opsional)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 rounded-2xl p-3.5 text-center cursor-pointer transition-all flex items-center justify-between"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-800">
                    {imagePreview ? 'Foto terpilih (Klik untuk ganti)' : 'Pilih Foto dari Galeri / Kamera HP'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Otomatis dikompres agar cepat tampil & hemat kuota warga
                  </p>
                </div>
              </div>

              {imagePreview && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImagePreview(null);
                    setCompressionInfo(null);
                  }}
                  className="text-xs text-rose-500 hover:underline px-2 font-semibold"
                >
                  Hapus Foto
                </button>
              )}
            </div>

            {imagePreview && (
              <div className="mt-2.5 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-40 rounded-xl object-contain border border-slate-200 shadow-sm"
                />
              </div>
            )}

            {compressionInfo && (
              <p className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg mt-1.5 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {compressionInfo}
              </p>
            )}
          </div>

          {/* Author Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Penulis / Warga <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Pak Hendra / Ibu Maya / Panitia"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Peran / Blok Rumah
              </label>
              <input
                type="text"
                placeholder="Contoh: Warga Blok A1 / Seksi Lomba 17an"
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tagar / Kata Kunci (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              placeholder="Contoh: 17Agustus, TurnamenGaple, LombaAnak, KerjaBakti"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isCompressing}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              {postToEdit ? 'Simpan Perubahan' : 'Terbitkan Berita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
