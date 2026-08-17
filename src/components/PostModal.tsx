import React, { useState, useRef } from 'react';
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
  'Pengumuman RT',
  'Kerja Bakti',
  'Iuran & Kas',
  'Keamanan & Ronda',
  'Sosial & Warga',
  'Kesehatan & Posyandu',
  'Umum',
];

export const PostModal: React.FC<PostModalProps> = ({
  isOpen,
  onClose,
  onSave,
  postToEdit,
}) => {
  const [title, setTitle] = useState(postToEdit?.title || '');
  const [content, setContent] = useState(postToEdit?.content || '');
  const [category, setCategory] = useState<PostCategory>(postToEdit?.category || 'Pengumuman RT');
  const [authorName, setAuthorName] = useState(postToEdit?.authorName || 'Pak Akhmad Khudri');
  const [authorRole, setAuthorRole] = useState(postToEdit?.authorRole || 'Ketua RT 01 Green Bussan');
  const [isPinned, setIsPinned] = useState(postToEdit?.isPinned || false);
  const [tagsInput, setTagsInput] = useState(postToEdit?.tags?.join(', ') || '');
  const [imagePreview, setImagePreview] = useState<string | null>(postToEdit?.images?.[0] || null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    setCompressionInfo(null);
    const originalKb = Math.round(file.size / 1024);

    try {
      const compressedDataUrl = await compressImageFile(file, 1200, 1200, 0.82);
      setImagePreview(compressedDataUrl);
      const compressedKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);
      setCompressionInfo(`Foto dioptimalkan: ${originalKb} KB ➔ ${compressedKb} KB`);
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
      alert('Mohon isi judul dan isi pengumuman.');
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
      authorName: authorName.trim() || 'Pengurus RT 01',
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 relative my-8 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {postToEdit ? 'Edit Kabar / Pengumuman' : 'Buat Informasi & Pengumuman Baru'}
              </h2>
              <p className="text-xs text-slate-500">
                Informasi resmi yang akan tampil di papan pengumuman warga komplek
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category & Pin Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kategori Informasi
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PostCategory)}
                className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 sm:pt-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
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
              Judul Informasi / Pengumuman <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Jadwal Fogging Nyamuk DBD & Kerja Bakti Saluran Air"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Isi Lengkap Informasi <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Tuliskan detail pengumuman, tanggal pelaksanaan, tata cara, atau imbauan bagi warga komplek..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Image Attachment with Auto Compression */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Lampirkan Foto Pengumuman (Opsional)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 rounded-xl p-3.5 text-center cursor-pointer transition-all flex items-center justify-between"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-800">
                    {imagePreview ? 'Foto terpilih (Klik untuk ganti)' : 'Pilih Foto dari Galeri / Kamera'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Otomatis dikompres agar hemat kuota & cepat tampil
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
                  className="text-xs text-red-500 hover:underline px-2"
                >
                  Hapus Foto
                </button>
              )}
            </div>

            {imagePreview && (
              <div className="mt-2 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-36 rounded-lg object-contain border border-slate-200"
                />
              </div>
            )}

            {compressionInfo && (
              <p className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded mt-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {compressionInfo}
              </p>
            )}
          </div>

          {/* Author Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Pembuat / Pengurus
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Pak Akhmad Khudri"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jabatan / Peran
              </label>
              <input
                type="text"
                placeholder="Contoh: Ketua RT 01 / Seksi Keamanan"
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
              placeholder="Contoh: Pengumuman, Iuran, KerjaBakti"
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
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {postToEdit ? 'Simpan Perubahan' : 'Terbitkan Pengumuman'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
