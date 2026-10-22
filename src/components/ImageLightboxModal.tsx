import React from 'react';
import { X, ZoomIn, Download, ExternalLink } from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  subtitle?: string;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  subtitle
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="w-full max-w-3xl flex items-center justify-between pb-3 text-white border-b border-white/20 mb-3">
        <div>
          <h3 className="text-sm sm:text-base font-black flex items-center gap-2">
            <ZoomIn className="w-4 h-4 text-emerald-400" />
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-white/70 font-medium">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <a
            href={imageUrl}
            download={`wg-doc-${Date.now()}.jpg`}
            target="_blank"
            rel="noreferrer"
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all text-xs flex items-center gap-1"
            title="Download / Open Full"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Save</span>
          </a>
          <button
            onClick={onClose}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Image Container */}
      <div className="w-full max-w-3xl flex-1 flex items-center justify-center overflow-auto p-2">
        <img
          src={imageUrl}
          alt={title}
          className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/10 bg-slate-900"
        />
      </div>

      <div className="mt-2 text-center text-[11px] text-white/60">
        Click anywhere outside or press Close to return. High-resolution inspection active.
      </div>
    </div>
  );
};
