import React, { useState } from 'react';
import { TalapLogo, LogoVariant } from './ui/TalapLogo';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  Layers, 
  ShieldCheck, 
  Sparkles, 
  Maximize2,
  Minimize2,
  FileCode,
  Eye
} from 'lucide-react';
import { useToast } from './ui/Toast';

interface BrandKitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BrandKitModal: React.FC<BrandKitModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'main' | 'favicon' | 'watermark'>('main');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const mainSvgCode = `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mentorGrad" x1="14" y1="44" x2="48" y2="74" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#8B5CF6"/>
      <stop offset="100%" stop-color="#6D28D9"/>
    </linearGradient>
    <linearGradient id="studentGrad" x1="53" y1="50" x2="86" y2="74" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#A78BFA"/>
      <stop offset="100%" stop-color="#7C3AED"/>
    </linearGradient>
    <linearGradient id="capGrad" x1="57" y1="17" x2="87" y2="30" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#DDD6FE"/>
      <stop offset="100%" stop-color="#A78BFA"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="34" y1="46" x2="66" y2="70" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#F5F3FF"/>
    </linearGradient>
  </defs>
  <!-- Business Figure (Left) -->
  <circle cx="28" cy="27" r="9.5" fill="#DDD6FE"/>
  <path d="M14 74C14 52 23 44.5 35 44.5C39 44.5 45 48.5 48 53" stroke="url(#mentorGrad)" stroke-width="8" stroke-linecap="round"/>
  <path d="M28 45.5L25 60L32 64" stroke="#DDD6FE" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Student Figure (Right) -->
  <path d="M72 17L87 23.5L72 30L57 23.5L72 17Z" fill="url(#capGrad)"/>
  <path d="M87 23.5V33" stroke="#DDD6FE" stroke-width="2.8" stroke-linecap="round"/>
  <circle cx="87" cy="34" r="2.2" fill="#DDD6FE"/>
  <circle cx="72" cy="38" r="9.5" fill="#EDE9FE"/>
  <path d="M86 74C86 56 79 50 67 50C63 50 57 53 53 56" stroke="url(#studentGrad)" stroke-width="8" stroke-linecap="round"/>
  <!-- Task Card Exchange (Center) -->
  <rect x="34" y="46" width="32" height="24" rx="5" fill="url(#cardGrad)" stroke="#7047EB" stroke-width="1.8"/>
  <rect x="38.5" y="51.5" width="7" height="6" rx="1.5" fill="#7047EB"/>
  <path d="M48.5 53.5H60M48.5 56.5H57.5M38.5 63.5H60" stroke="#8B5CF6" stroke-width="2.2" stroke-linecap="round"/>
  <!-- Exchange Spark -->
  <path d="M50 36V40M42 38L44.5 41.5M58 38L55.5 41.5" stroke="#A78BFA" stroke-width="2.5" stroke-linecap="round"/>
</svg>`;

  const faviconSvgCode = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="9" cy="8.5" r="3.2" fill="#C4B5FD"/>
  <path d="M4.5 25C4.5 17.5 7.5 14.5 12 14.5C13.5 14.5 15.5 16 17 18" stroke="#8B5CF6" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M23 7.5L28.5 10L23 12.5L17.5 10L23 7.5Z" fill="#A78BFA"/>
  <path d="M28.5 10V14" stroke="#A78BFA" stroke-width="1.2" stroke-linecap="round"/>
  <circle cx="23" cy="14" r="3.2" fill="#E0E7FF"/>
  <path d="M27.5 25C27.5 19 25 17 21 17C19.5 17 17.5 18 16 19" stroke="#7047EB" stroke-width="3.2" stroke-linecap="round"/>
  <rect x="10.5" y="15.5" width="11" height="8" rx="2" fill="#FFFFFF" stroke="#7047EB" stroke-width="1.2"/>
  <path d="M13 18.5H16.5M13 21H19" stroke="#7047EB" stroke-width="1.1" stroke-linecap="round"/>
</svg>`;

  const watermarkSvgCode = `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="28" cy="27" r="9.5" fill="#FFFFFF"/>
  <path d="M14 74C14 52 23 44.5 35 44.5C39 44.5 45 48.5 48 53" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/>
  <path d="M28 45.5L25 60L32 64" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M72 17L87 23.5L72 30L57 23.5L72 17Z" fill="#FFFFFF"/>
  <path d="M87 23.5V33" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
  <circle cx="87" cy="34" r="2" fill="#FFFFFF"/>
  <circle cx="72" cy="38" r="9.5" fill="#FFFFFF"/>
  <path d="M86 74C86 56 79 50 67 50C63 50 57 53 53 56" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/>
  <rect x="34" y="46" width="32" height="24" rx="5" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="2"/>
  <rect x="39" y="52" width="7" height="6" rx="1.5" fill="#120A2E"/>
  <path d="M49 53.5H60M49 56.5H58M39 63.5H60" stroke="#120A2E" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M50 36V40M42 38L44.5 41.5M58 38L55.5 41.5" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round"/>
</svg>`;

  const handleCopySvg = (code: string, label: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(label);
    showToast(`SVG код ${label} скопирован в буфер обмена!`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl border border-[#E2E5EE] shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 bg-[#150B2D] text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/15">
              <TalapLogo size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-white">
                  Brand Identity & Vector Logo System
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#7047EB] text-white uppercase tracking-wider">
                  Purple-First
                </span>
              </div>
              <p className="text-xs text-white/70 mt-0.5">
                Концепция «Бизнес ставит задачу → Студент реализует её»
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-[#E2E5EE] bg-[#F8F9FC]">
          <button
            type="button"
            onClick={() => setActiveTab('main')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'main'
                ? 'border-[#7047EB] text-[#7047EB]'
                : 'border-transparent text-[#667085] hover:text-[#17171C]'
            }`}
          >
            1. Основной логотип (Transparent & Dark)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('favicon')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'favicon'
                ? 'border-[#7047EB] text-[#7047EB]'
                : 'border-transparent text-[#667085] hover:text-[#17171C]'
            }`}
          >
            2. Фавикон (16×16 & 32×32)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('watermark')}
            className={`pb-3 px-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${
              activeTab === 'watermark'
                ? 'border-[#7047EB] text-[#7047EB]'
                : 'border-transparent text-[#667085] hover:text-[#17171C]'
            }`}
          >
            3. Водяной знак / Монохром
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: MAIN LOGO */}
          {activeTab === 'main' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Dark Background Showcase */}
                <div className="p-8 rounded-2xl bg-[#0D081E] border border-white/10 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
                    На тёмном фоне (#0D081E)
                  </div>
                  <div className="p-4 rounded-3xl bg-white/5 border border-white/10 shadow-2xl">
                    <TalapLogo size={120} />
                  </div>
                  <span className="text-xs text-white/80 font-medium">
                    Идеально для тёмной темы, сплэш-скрина и мобильной иконки
                  </span>
                </div>

                {/* Transparent / Light Canvas Showcase */}
                <div className="p-8 rounded-2xl bg-[#F4F5F9] border border-[#E2E5EE] flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">
                    На светлом фоне (Прозрачный SVG)
                  </div>
                  <div className="p-4 rounded-3xl bg-white border border-[#E2E5EE] shadow-md">
                    <TalapLogo size={120} />
                  </div>
                  <span className="text-xs text-[#667085] font-medium">
                    Идеально для светлого хедера, документов и промо-материалов
                  </span>
                </div>
              </div>

              {/* Scales Grid */}
              <div className="p-5 rounded-2xl bg-[#F8F9FC] border border-[#E2E5EE] space-y-3">
                <div className="text-xs font-bold text-[#17171C]">
                  Масштабируемость в интерфейсе (24px, 32px, 48px, 64px, 80px):
                </div>
                <div className="flex items-end gap-6 bg-white p-4 rounded-xl border border-[#E2E5EE] overflow-x-auto">
                  <div className="flex flex-col items-center gap-1.5">
                    <TalapLogo size={24} />
                    <span className="text-[10px] text-[#667085] font-bold">24px</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <TalapLogo size={32} />
                    <span className="text-[10px] text-[#667085] font-bold">32px</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <TalapLogo size={48} />
                    <span className="text-[10px] text-[#667085] font-bold">48px</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <TalapLogo size={64} />
                    <span className="text-[10px] text-[#667085] font-bold">64px</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5">
                    <TalapLogo size={80} />
                    <span className="text-[10px] text-[#667085] font-bold">80px</span>
                  </div>
                </div>
              </div>

              {/* Copy SVG Action */}
              <div className="flex items-center justify-between p-4 bg-[#F0ECFF] rounded-2xl border border-[#7047EB]/20">
                <div className="text-xs text-[#7047EB] font-bold">
                  Исходный масштабируемый SVG-код основного логотипа:
                </div>
                <button
                  type="button"
                  onClick={() => handleCopySvg(mainSvgCode, 'Main Logo')}
                  className="px-4 py-2 bg-[#7047EB] hover:bg-[#5E32DF] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedCode === 'Main Logo' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Копировать SVG</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: FAVICON */}
          {activeTab === 'favicon' && (
            <div className="space-y-6">
              <div className="p-6 bg-[#150B2D] text-white rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider">
                    Специальная оптимизация под малые размеры
                  </span>
                  <span className="text-xs font-semibold text-white/60">
                    Чёткая геометрия без мелкого шума
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-2 text-center">
                    <div className="w-10 h-10 rounded-lg bg-[#7047EB] flex items-center justify-center p-1">
                      <TalapLogo variant="favicon" size={16} />
                    </div>
                    <span className="text-[11px] font-bold text-white">16 × 16 px</span>
                    <span className="text-[10px] text-white/60">Вкладка браузера</span>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-2 text-center">
                    <div className="w-12 h-12 rounded-xl bg-[#7047EB] flex items-center justify-center p-1.5">
                      <TalapLogo variant="favicon" size={32} />
                    </div>
                    <span className="text-[11px] font-bold text-white">32 × 32 px</span>
                    <span className="text-[10px] text-white/60">Retina фавикон</span>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-2 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#7047EB] flex items-center justify-center p-2">
                      <TalapLogo variant="favicon" size={48} />
                    </div>
                    <span className="text-[11px] font-bold text-white">48 × 48 px</span>
                    <span className="text-[10px] text-white/60">Закладки Safari</span>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center gap-2 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-[#7047EB] flex items-center justify-center p-2.5">
                      <TalapLogo variant="favicon" size={64} />
                    </div>
                    <span className="text-[11px] font-bold text-white">64 × 64 px</span>
                    <span className="text-[10px] text-white/60">PWA иконка</span>
                  </div>
                </div>
              </div>

              {/* Copy Favicon Action */}
              <div className="flex items-center justify-between p-4 bg-[#F0ECFF] rounded-2xl border border-[#7047EB]/20">
                <div className="text-xs text-[#7047EB] font-bold">
                  Исходный SVG-код фавикона:
                </div>
                <button
                  type="button"
                  onClick={() => handleCopySvg(faviconSvgCode, 'Favicon')}
                  className="px-4 py-2 bg-[#7047EB] hover:bg-[#5E32DF] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copiedCode === 'Favicon' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Скопировано!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Копировать Favicon SVG</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: WATERMARK / MONOCHROME */}
          {activeTab === 'watermark' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Monochrome White */}
                <div className="p-6 rounded-2xl bg-[#120A2E] text-white space-y-3 flex flex-col items-center text-center">
                  <span className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider">
                    Монохромный белый (для тёмных подложек)
                  </span>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <TalapLogo variant="monochrome-white" size={90} />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopySvg(watermarkSvgCode, 'Monochrome White')}
                    className="mt-2 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Копировать White SVG
                  </button>
                </div>

                {/* Monochrome Purple */}
                <div className="p-6 rounded-2xl bg-[#F8F9FC] border border-[#E2E5EE] space-y-3 flex flex-col items-center text-center">
                  <span className="text-xs font-bold text-[#7047EB] uppercase tracking-wider">
                    Монохромный фиолетовый (для документов и штампов)
                  </span>
                  <div className="p-4 bg-[#F0ECFF] rounded-2xl border border-[#7047EB]/20">
                    <TalapLogo variant="monochrome-purple" size={90} />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopySvg(watermarkSvgCode.replace(/#FFFFFF/g, '#7047EB').replace(/#120A2E/g, '#FFFFFF'), 'Monochrome Purple')}
                    className="mt-2 px-3.5 py-1.5 bg-[#7047EB] hover:bg-[#5E32DF] text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Копировать Purple SVG
                  </button>
                </div>
              </div>

              {/* Semantic Guide */}
              <div className="p-4 bg-[#F8F9FC] rounded-2xl border border-[#E2E5EE] space-y-2 text-xs">
                <div className="font-bold text-[#17171C]">
                  Семантика элементов логотипа:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[#667085]">
                  <div className="p-2.5 bg-white rounded-xl border border-[#E2E5EE]">
                    <span className="font-bold text-[#17171C] block mb-0.5">1. Фигура слева (Бизнес)</span>
                    Лаконичный силуэт ментора компании, формулирующего задачу.
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-[#E2E5EE]">
                    <span className="font-bold text-[#7047EB] block mb-0.5">2. Карточка в центре</span>
                    Практическая задача бизнеса, передаваемая в работу.
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-[#E2E5EE]">
                    <span className="font-bold text-[#2CC7B5] block mb-0.5">3. Фигура справа (Студент)</span>
                    Студент в академической шапочке, принимающий вызов.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F8F9FC] border-t border-[#E2E5EE] flex items-center justify-between">
          <div className="text-xs text-[#667085] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2CC7B5]" />
            <span>Палитра: Deep Violet #150B2D · Electric Purple #7047EB · Lavender #DDD6FE · White</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#17171C] hover:bg-black text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </motion.div>
    </div>
  );
};
