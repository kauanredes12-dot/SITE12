import { useEffect, useState } from 'react';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { uploadImage, validateImageFile, type ImageBucket } from '@/services/adminStorage';

type ImageUploadFieldProps = {
  id: string;
  label: string;
  folder: string;
  bucket?: ImageBucket;
  value: string | null;
  onChange: (url: string | null) => void;
  aspect?: 'cover' | 'square' | 'banner' | 'mobile';
};

export function ImageUploadField({
  id,
  label,
  folder,
  bucket = 'product-covers',
  value,
  onChange,
  aspect = 'cover',
}: ImageUploadFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleFile = async (file: File) => {
    setError(null);
    const problem = validateImageFile(file, bucket);
    if (problem) {
      setError(problem);
      return;
    }
    setPreviewUrl(URL.createObjectURL(file));
    setIsUploading(true);
    try {
      onChange(await uploadImage(file, folder, bucket));
      setPreviewUrl(null);
    } catch (cause) {
      setPreviewUrl(null);
      setError(cause instanceof Error ? cause.message : 'Erro ao enviar a imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  const shownUrl = previewUrl ?? value;
  const frame =
    aspect === 'banner'
      ? 'aspect-[16/6] w-full sm:w-96'
      : aspect === 'mobile'
        ? 'aspect-[4/3] w-full sm:w-56'
        : aspect === 'cover'
          ? 'aspect-[3/4] w-40'
          : 'aspect-square w-40';
  const fit = aspect === 'banner' || aspect === 'mobile' ? 'object-contain' : 'object-cover';

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-semibold text-ink-900">{label}</span>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className={`${frame} relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ink-100 ring-1 ring-inset ring-ink-200`}>
          {shownUrl ? (
            <img src={shownUrl} alt="Pré-visualização" className={`h-full w-full ${fit}`} />
          ) : (
            <ImagePlus size={28} className="text-ink-500" aria-hidden="true" />
          )}
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 size={24} className="animate-spin text-brand-700" aria-label="Enviando" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <label
            htmlFor={id}
            className={`inline-flex h-10 w-fit cursor-pointer items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-ink-900 ring-1 ring-inset ring-ink-200 transition-all hover:-translate-y-0.5 hover:ring-brand-500 ${
              isUploading ? 'pointer-events-none opacity-60' : ''
            }`}
          >
            <ImagePlus size={16} aria-hidden="true" />
            {value ? 'Trocar imagem' : 'Enviar imagem'}
          </label>
          <input
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={isUploading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file) void handleFile(file);
            }}
          />
          {value && !isUploading && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="inline-flex h-10 w-fit items-center gap-2 rounded-xl px-4 text-sm font-semibold text-error-700 transition-colors hover:bg-error-50"
            >
              <Trash2 size={16} aria-hidden="true" />
              Remover imagem
            </button>
          )}
          <p className="text-xs leading-relaxed text-ink-500">JPG, PNG ou WebP, até 5 MB.</p>
          {error && (
            <p role="alert" className="text-sm font-medium text-error-700">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
