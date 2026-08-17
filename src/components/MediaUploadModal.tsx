import React, { useState, useRef } from 'react';
import { X, Upload, Film, Image as ImageIcon, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { MediaItem, MediaType } from '../types';
import { compressImageFile, extractYouTubeEmbedUrl } from '../utils/mediaUtils';

interface MediaUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: MediaItem) => void;
  existingAlbums: string[];
}

export const MediaUploadModal: React.FC<MediaUploadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingAlbums,
}) => {
  const [mediaType, setMediaType] = useState<MediaType>('photo');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [albumName, setAlbumName] = useState(existingAlbums[0] || 'Kegiatan Warga');
  const [customAlbum, setCustomAlbum] = useState('');
  const [uploadedBy, setUploadedBy] = useState('');
  const [date, setDate] = useState(new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
  const [tagInput, setTagInput] = useState('');

  // Photo state
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  // Video state
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoPreviewEmbed, setVideoPreviewEmbed] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    setCompressionInfo(null);

    const originalSizeKb = Math.round(file.size / 1024);

    try {
      const compressedDataUrl = await compressImageFile(file, 1280, 1280, 0.82);
      setImagePreview(compressedDataUrl);

      // Estimate compressed size from base64 string
      const compressedSizeKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);
      setCompressionInfo(`Ukuran asli: ${originalSizeKb} KB ➔ Terkompresi: ${compressedSizeKb} KB (Siap simpan cepat)`);
    } catch (err) {
      console.error(err);
      alert('Gagal mengompres gambar. Silakan coba gambar lain.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleVideoUrlChange = (url: string) => {
    setVideoUrlInput(url);
    const embed = extractYouTubeEmbedUrl(url);
    setVideoPreviewEmbed(embed);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalAlbum = albumName === '__new__' ? customAlbum.trim() : albumName;
    if (!finalAlbum) {
      alert('Mohon isi nama album.');
      return;
    }

    if (!title.trim()) {
      alert('Mohon masukkan judul dokumentasi.');
      return;
    }

    let finalUrl = '';
    if (mediaType === 'photo') {
      finalUrl = imagePreview || imageUrlInput.trim();
      if (!finalUrl) {
        alert('Mohon pilih file foto atau masukkan tautan URL gambar.');
        return;
      }
    } else {
      if (!videoPreviewEmbed) {
        alert('Mohon masukkan tautan video YouTube / embed yang valid.');
        return;
      }
      finalUrl = videoPreviewEmbed;
    }

    const tags = tagInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const newItem: MediaItem = {
      id: `media-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      albumName: finalAlbum,
      type: mediaType,
      url: finalUrl,
      thumbnailUrl: mediaType === 'video' ? 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80' : undefined,
      date: date.trim() || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      uploadedBy: uploadedBy.trim() || 'Warga Green Bussan',
      likes: 0,
      tags: tags.length > 0 ? tags : undefined,
    };

    onSave(newItem);
    onClose();
  };

  return (
    <div
      id="media-upload-modal"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-slate-200 relative my-8 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Unggah Dokumentasi Kegiatan</h2>
              <p className="text-xs text-slate-500">
                Bagikan foto kegiatan atau video sematan ke portal warga Green Bussan
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

        {/* Media Type Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
          <button
            type="button"
            onClick={() => setMediaType('photo')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
              mediaType === 'photo'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Foto Kegiatan (Auto Compress)
          </button>
          <button
            type="button"
            onClick={() => setMediaType('video')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
              mediaType === 'video'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Film className="w-4 h-4" />
            Video Sematan (YouTube)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PHOTO UPLOAD SECTION */}
          {mediaType === 'photo' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pilih Foto dari Perangkat / Kamera
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/80 rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {imagePreview ? (
                  <div className="space-y-2 w-full flex flex-col items-center">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-48 rounded-lg object-contain border border-emerald-200 shadow-sm"
                    />
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-100 px-3 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Foto Terkompresi & Siap Unggah
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {isCompressing ? 'Mengompres gambar...' : 'Klik untuk pilih foto'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Mendukung JPG, PNG, WEBP dari kamera HP & laptop
                      </p>
                    </div>
                  </>
                )}
              </div>

              {compressionInfo && (
                <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg mt-2 flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  {compressionInfo}
                </p>
              )}

              {/* Alternative URL */}
              <div className="mt-2.5">
                <span className="text-[11px] text-slate-400 block mb-1">
                  Atau masukkan link gambar online:
                </span>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... atau link gambar"
                  value={imageUrlInput}
                  onChange={(e) => {
                    setImageUrlInput(e.target.value);
                    if (!imagePreview) setImagePreview(e.target.value);
                  }}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* VIDEO URL SECTION */}
          {mediaType === 'video' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tautan Video YouTube / Shorts
              </label>
              <input
                type="url"
                required
                placeholder="Contoh: https://www.youtube.com/watch?v=... atau youtu.be/..."
                value={videoUrlInput}
                onChange={(e) => handleVideoUrlChange(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Sistem otomatis memformat video agar bisa diputar langsung di galeri warga.
              </p>

              {videoPreviewEmbed && (
                <div className="mt-3 aspect-video rounded-xl overflow-hidden bg-black border border-slate-200">
                  <iframe
                    src={videoPreviewEmbed}
                    title="Preview Video"
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Judul Dokumentasi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Gotong Royong Saluran Air Blok B & C"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Album Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Album Kegiatan</label>
              <select
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                {existingAlbums.map((alb) => (
                  <option key={alb} value={alb}>
                    {alb}
                  </option>
                ))}
                <option value="__new__">+ Buat Album Baru...</option>
              </select>
            </div>

            {albumName === '__new__' && (
              <div>
                <label className="block text-xs font-bold text-emerald-700 mb-1">Nama Album Baru</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Nobar Final Badminton 2026"
                  value={customAlbum}
                  onChange={(e) => setCustomAlbum(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-emerald-50/50"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Pengunggah / Warga</label>
              <input
                type="text"
                placeholder="Contoh: Pak Hendra (Blok A1)"
                value={uploadedBy}
                onChange={(e) => setUploadedBy(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan / Cerita Momen</label>
            <textarea
              rows={2}
              placeholder="Ceritakan momen seru atau informasi di balik foto/video ini..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Tags & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Kegiatan</label>
              <input
                type="text"
                placeholder="Contoh: 18 Agustus 2026"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tagar (Pisahkan Koma)</label>
              <input
                type="text"
                placeholder="KerjaBakti, Lingkungan, GotongRoyong"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
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
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              Simpan & Tayangkan di Galeri
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
