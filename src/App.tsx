/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, Suspense, lazy, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Monitor,
  Layout,
  Check,
  Wand2,
  Package
} from 'lucide-react';
import { STEPS, CATS, Option, HEIGHT_OPTIONS } from './data';

const TrailerScene = lazy(() => import('./components/TrailerScene'));

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, Option>>({
    foundation: STEPS[0].options[3], // Default to 8.5 x 24 ft
    height: HEIGHT_OPTIONS[0] // Default to standard
  });
  const stepsScrollRef = useRef<HTMLDivElement>(null);

  const activeStep = STEPS[activeStepIndex];

  // Extract length for per-LFT calculations
  const selectedLength = useMemo(() => {
    const found = selections.foundation?.label || '';
    const match = found.match(/(\d+)\s*ft/);
    return match ? parseInt(match[1]) : 24;
  }, [selections.foundation]);

  const parsePrice = (priceStr: string, length: number) => {
    if (priceStr === 'Included' || priceStr === '$0 swap') return 0;

    // Remove symbols and parse
    const clean = priceStr.replace(/[$,+]/g, '');

    if (clean.includes('/LFT')) {
      const rate = parseFloat(clean.split('/')[0]);
      return rate * length;
    }

    return parseFloat(clean.replace(/,/g, ''));
  };

  const totalPrice = useMemo(() => {
    return (Object.values(selections) as Option[]).reduce((acc, option) => {
      return acc + parsePrice(option.price, selectedLength);
    }, 0);
  }, [selections, selectedLength]);

  const getIncompatibility = (stepId: string, option: Option): string | null => {
    // Length-based constraints
    if (stepId === 'suspension') {
      if (selectedLength >= 26 && option.label.includes('3500 lb')) {
        return "Incompatible with 26ft+";
      }
      if (selectedLength === 34 && (option.label.toLowerCase().includes('tandem') || option.label.includes('Spread Axle'))) {
        return "34ft is Triple Axle Only";
      }
      if (option.label.includes('Spread Axle') && !selections.suspension?.label.includes('Torsion')) {
        return "Requires Torsion Suspension";
      }
    }

    // Height-based constraints for doors
    if (stepId === 'doors') {
      const heightLabel = selections.height?.label || '';
      const heightMatch = heightLabel.match(/\+(\d+)/);
      const addedHeight = heightMatch ? parseInt(heightMatch[1]) : 0;

      if (addedHeight >= 18) {
        if (!option.label.includes('Super Duty Ramp')) {
          return "+18\" Height Requires Super Duty Ramp";
        }
      }
    }

    // Climate requires Electrical
    if (stepId === 'climate') {
      if (option.label.includes('A/C') || option.label.includes('Heat')) {
        const hasElectrical = selections.electrical?.label.includes('110v');
        if (!hasElectrical) {
          return "Requires 110v Electrical Package";
        }
      }
    }

    // Nose-based constraints
    if (stepId === 'storage') {
      const noseSelection = selections.nose?.label || '';
      if (option.note?.includes("V-nose only") && !noseSelection.includes('V-Nose')) {
        return "Requires V-Nose Front";
      }
    }

    return null;
  };

  const handleSelect = (option: Option) => {
    if (getIncompatibility(activeStep.id, option)) return;

    setSelections(prev => ({
      ...prev,
      [activeStep.id]: option
    }));
  };

  const nextStep = () => {
    if (activeStepIndex < STEPS.length - 1) {
      setActiveStepIndex(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(prev => prev - 1);
    }
  };

  const scrollStepsLeft = () => {
    prevStep();
  };

  const scrollStepsRight = () => {
    nextStep();
  };

  useEffect(() => {
    if (stepsScrollRef.current) {
      const activeButton = stepsScrollRef.current.querySelector(`button:nth-child(${activeStepIndex + 1})`);
      if (activeButton) {
        activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeStepIndex]);

  // Helper for UI grouping/components
  const renderOptions = () => {
    if (activeStep.id === 'foundation') {
      return (
        <div className="space-y-12 py-4">
          {/* Length Slider */}
          <div className="space-y-6">
            <div className="flex justify-between items-end pb-3">
              <div className="text-[14px] font-display uppercase text-primary">
                TRAILER LENGTH {selections.foundation?.label || STEPS[0].options[0].label}
              </div>
              <div className="text-[11px] font-mono font-bold text-foreground/40">
                {selections.foundation?.price || STEPS[0].options[0].price}
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative h-2 flex items-center bg-surface-dim overflow-visible group/slider"
            >
              {/* Technical Ruler Background */}
              <div className="absolute inset-0 flex items-center pointer-events-none">
                <div className="w-full h-[1px] bg-white/5" />
              </div>

              {/* Technical Ticks */}
              <div className="absolute inset-0 flex justify-between items-center px-[2px] pointer-events-none">
                {Array.from({ length: (STEPS[0].options.length - 1) * 4 + 1 }).map((_, i) => {
                  // Every 4th tick is a major tick (matches an option)
                  const isMajor = i % 4 === 0;
                  const optionIndex = i / 4;
                  const opt = isMajor ? STEPS[0].options[optionIndex] : null;
                  const isActive = opt && selections.foundation?.label === opt.label;

                  return (
                    <div key={i} className="relative flex flex-col items-center">
                      <div className={`w-[1px] transition-all duration-300 ${isMajor
                          ? isActive ? 'h-6 bg-primary' : 'h-4 bg-white/20'
                          : 'h-2 bg-white/5'
                        }`} />
                    </div>
                  );
                })}
              </div>

              <input
                type="range"
                min="0"
                max={STEPS[0].options.length - 1}
                step="1"
                value={STEPS[0].options.findIndex(o => o.label === selections.foundation?.label)}
                onChange={(e) => setSelections(prev => ({ ...prev, foundation: STEPS[0].options[parseInt(e.target.value)] }))}
                className="w-full h-2 bg-transparent appearance-none cursor-pointer outline-none accent-primary relative z-10 [&::-webkit-slider-thumb]:w-0 [&::-webkit-slider-thumb]:h-0 [&::-webkit-slider-thumb]:appearance-none"
              />

              {/* Custom Thumb - Red Line (Technical Style) */}
              <motion.div
                animate={{
                  left: `${(STEPS[0].options.findIndex(o => o.label === selections.foundation?.label) / (STEPS[0].options.length - 1)) * 100}%`
                }}
                className="absolute w-[2px] h-10 bg-primary pointer-events-none z-20 flex flex-col items-center"
              >
                <div className="w-3 h-3 bg-primary rounded-full mb-1 scale-75" />
                <div className="absolute -top-6 text-[10px] font-mono font-bold text-primary bg-background px-1 border border-primary/20">
                  {selections.foundation?.label.match(/(\d+)\sft/)?.[1]}'
                </div>
              </motion.div>

              <div className="absolute top-[-36px] left-0 right-0 flex justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity pointer-events-none">
                <span className="text-[10px] bg-primary text-white px-2 py-0.5 font-mono font-bold uppercase tracking-wider">adjust_length</span>
              </div>
            </motion.div>

            <div className="flex justify-between text-[11px] font-mono font-bold tracking-[1.2px] uppercase text-foreground/40 mt-2">
              <div className="flex flex-col">
                <span className="text-foreground/60">{STEPS[0].options[0].label.match(/(\d+)/)?.[1] || '18'} FT</span>
                <span className="text-[8px] opacity-40">MIN_CAP</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-foreground/60">{STEPS[0].options[STEPS[0].options.length - 1].label.match(/(\d+)/)?.[1] || '34'} FT</span>
                <span className="text-[8px] opacity-40">MAX_CAP</span>
              </div>
            </div>

            <div className="space-y-6 opacity-30 cursor-not-allowed">
              <div className="flex justify-between items-end pb-3">
                <div className="text-[14px] font-display uppercase">
                  TRAILER WIDTH 8.5 FT (LOCKED)
                </div>
                <div className="text-[11px] font-mono font-bold uppercase text-foreground/40">
                  STANDARD SPEC
                </div>
              </div>
              <div className="h-2 bg-surface-dim w-full relative">
                <div className="absolute left-[85%] -top-2 w-[1px] h-6 bg-foreground/20" />
              </div>
              <div className="flex justify-between text-[10px] font-mono font-bold tracking-[1.2px] uppercase">
                <span>7.0 FT</span>
                <span>8.5 FT</span>
              </div>
            </div>
          </div>

          {/* Height Slider */}
          <div className="space-y-6 pt-10">
            <div className="flex justify-between items-end pb-3">
              <div className="text-[14px] font-display uppercase text-primary">
                TRAILER HEIGHT {selections.height?.label}
              </div>
              <div className="text-[11px] font-mono font-bold text-foreground/40">
                {selections.height?.price}
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative h-2 flex items-center bg-surface-dim group/slider-h"
            >
              {/* Technical Ruler Background */}
              <div className="absolute inset-0 flex items-center pointer-events-none">
                <div className="w-full h-[1px] bg-white/5" />
              </div>

              {/* Technical Ticks */}
              <div className="absolute inset-0 flex justify-between items-center px-[2px] pointer-events-none">
                {Array.from({ length: (HEIGHT_OPTIONS.length - 1) * 4 + 1 }).map((_, i) => {
                  const isMajor = i % 4 === 0;
                  const optionIndex = i / 4;
                  const opt = isMajor ? HEIGHT_OPTIONS[optionIndex] : null;
                  const isActive = opt && selections.height?.label === opt.label;

                  return (
                    <div key={i} className="relative flex flex-col items-center">
                      <div className={`w-[1px] transition-all duration-300 ${isMajor
                          ? isActive ? 'h-6 bg-primary' : 'h-4 bg-white/20'
                          : 'h-2 bg-white/5'
                        }`} />
                    </div>
                  );
                })}
              </div>

              <input
                type="range"
                min="0"
                max={HEIGHT_OPTIONS.length - 1}
                step="1"
                value={HEIGHT_OPTIONS.findIndex(o => o.label === selections.height?.label)}
                onChange={(e) => setSelections(prev => ({ ...prev, height: HEIGHT_OPTIONS[parseInt(e.target.value)] }))}
                className="w-full h-2 bg-transparent appearance-none cursor-pointer outline-none accent-primary relative z-10 [&::-webkit-slider-thumb]:w-0 [&::-webkit-slider-thumb]:h-0 [&::-webkit-slider-thumb]:appearance-none"
              />

              {/* Custom Thumb */}
              <motion.div
                animate={{
                  left: `${(HEIGHT_OPTIONS.findIndex(o => o.label === selections.height?.label) / (HEIGHT_OPTIONS.length - 1)) * 100}%`
                }}
                className="absolute w-[2px] h-10 bg-primary pointer-events-none z-20 flex flex-col items-center"
              >
                <div className="w-3 h-3 bg-primary rounded-full mb-1 scale-75" />
                <div className="absolute -top-6 text-[10px] font-mono font-bold text-primary bg-background px-1 border border-primary/20">
                  {selections.height?.label.match(/\((\d+)/)?.[1]}"
                </div>
              </motion.div>

              <div className="absolute top-[-36px] left-0 right-0 flex justify-center opacity-0 group-hover/slider-h:opacity-100 transition-opacity pointer-events-none">
                <span className="text-[10px] bg-primary text-white px-2 py-0.5 font-mono font-bold uppercase tracking-wider">modify_vertical_spec</span>
              </div>
            </motion.div>

            <div className="flex justify-between text-[11px] font-mono font-bold tracking-[1.2px] uppercase text-foreground/40 mt-2">
              <span>{HEIGHT_OPTIONS[0].label.match(/\((\d+)/)?.[1] || '79'}" BASE</span>
              <span>{HEIGHT_OPTIONS[HEIGHT_OPTIONS.length - 1].label.match(/\((\d+)/)?.[1] || '114'}" MAX</span>
            </div>

            {selections.height?.detail && (
              <div className="bg-primary text-white p-6 mt-4 shadow-premium/5">
                <p className="text-[11px] font-mono uppercase leading-relaxed font-bold">
                  {selections.height?.detail}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeStep.id === 'exterior') {
      const colors = [
        { name: 'Matte Black', hex: '#000000' },
        { name: 'Arctic White', hex: '#FFFFFF' },
        { name: 'Charcoal', hex: '#333333' },
        { name: 'Silver Frost', hex: '#CCCCCC' },
        { name: 'Victory Red', hex: '#FF0000' },
        { name: 'Royal Blue', hex: '#0000FF' },
        { name: 'Arizona Beige', hex: '#D4B483' },
        { name: 'Yellow Gold', hex: '#FFA500' },
        { name: 'Emerald Green', hex: '#008000' },
        { name: 'Grey', hex: '#888888' },
      ];

      const premiumColors = [
        { name: 'Copper', hex: '#B87333' },
        { name: 'Brushed Metal', hex: '#A1A1AA' },
        { name: 'Electric Lime', hex: '#CCFF00' },
        { name: 'Cyan', hex: '#00FFFF' },
      ];

      return (
        <div className="space-y-10">
          <div>
            <div className="text-[11px] font-mono font-bold tracking-[1.5px] uppercase mb-6 pb-3 text-foreground/30">BASE_PALETTE</div>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-4 gap-6">
              {colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => handleSelect({ label: `Standard Color: ${c.name}`, price: 'Included' })}
                  className={`w-20 h-20 md:w-25 md:h-25 xl:w-20 xl:h-20 border-2 transition-all ${selections.exterior?.label.includes(c.name) ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-agency hover:border-primary'}`}
                >
                  <div className="w-full h-full border border-black/5" style={{ background: c.hex }} title={c.name} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-mono font-bold tracking-[1.5px] uppercase mb-6 pb-3 text-foreground/30">PREMIUM_FINISHES</div>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-4 gap-2">
              {premiumColors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => handleSelect({ label: `Premium Color: ${c.name}`, price: '+$350' })}
                  className={`w-20 h-20 md:w-25 md:h-25 xl:w-20 xl:h-20 border-2 transition-all ${selections.exterior?.label.includes(c.name) ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-agency hover:border-primary'}`}
                >
                  <div className="w-full h-full border border-black/5" style={{ background: c.hex }} title={c.name} />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="text-[11px] font-mono font-bold tracking-[1.5px] uppercase mb-4 pb-3 text-foreground/30">FINISH_OPTIONS</div>
            {activeStep.options.filter(o => !o.label.includes('Color:')).map((option, i) => (
              <div key={i}>
                <OptionButton option={option} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeStep.id === 'suspension') {
      const baseAxles = activeStep.options.filter(o => !o.label.includes('Spread Axle'));
      const spreadAxle = activeStep.options.find(o => o.label.includes('Spread Axle'));

      return (
        <div className="space-y-10">
          <div className="space-y-4">
            <div className="text-[11px] font-mono font-bold tracking-[1.5px] uppercase pb-3 text-foreground/30">CHASSIS AXLES</div>
            {baseAxles.map((option, i) => (
              <div key={i}>
                <OptionButton option={option} />
              </div>
            ))}
          </div>

          {spreadAxle && (() => {
            const incompatibility = getIncompatibility('suspension', spreadAxle);
            const isSelected = !!selections.spreadAxle;
            return (
              <div className="pt-10">
                <div className="text-[11px] font-mono font-bold tracking-[1.5px] uppercase mb-6 text-foreground/30">PERFORMANCE UPGRADE</div>
                <button
                  onClick={() => {
                    const currentSpread = selections.spreadAxle;
                    if (currentSpread) {
                      const newSelections = { ...selections };
                      delete newSelections.spreadAxle;
                      setSelections(newSelections);
                    } else {
                      setSelections(prev => ({ ...prev, spreadAxle: spreadAxle }));
                    }
                  }}
                  disabled={!!incompatibility}
                  className={`w-full group text-left border border-agency p-6 transition-all relative overflow-hidden ${isSelected
                      ? 'bg-primary text-white'
                      : incompatibility
                        ? 'bg-surface-dim opacity-30 cursor-not-allowed'
                        : 'bg-white hover:bg-surface-dim shadow-premium/5'
                    }`}
                >
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center space-x-6">
                      <div className={`w-10 h-10 border flex items-center justify-center transition-colors ${isSelected ? 'border-white/40 bg-white/10' : 'border-agency'}`}>
                        <Layout size={18} strokeWidth={2} />
                      </div>
                      <div>
                        <div className={`text-[15px] font-mono font-bold uppercase ${isSelected ? 'text-white' : incompatibility ? 'text-foreground/30 line-through' : 'text-foreground'}`}>
                          {spreadAxle.label}
                        </div>
                        <div className={`text-[10px] font-mono font-bold uppercase ${isSelected ? 'text-white/70' : 'text-foreground/40'}`}>
                          {incompatibility || spreadAxle.detail}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-[13px] font-mono font-bold ${isSelected ? 'text-white' : 'text-foreground/40'}`}>{spreadAxle.price}</div>
                      {isSelected && <div className="mt-2 text-white flex justify-end"><Check size={18} strokeWidth={3} /></div>}
                      {incompatibility && (
                        <span className="text-[8px] px-2 py-0.5 bg-error text-white font-mono font-bold tracking-[1.2px] uppercase border border-foreground/10 block mt-2">
                          INCOMPATIBLE
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            );
          })()}
        </div>
      );
    }

    if (activeStep.id === 'doors') {
      const groups = [
        { name: 'Rear Access', items: activeStep.options.filter(o => o.label.includes('Ramp') || o.label.includes('Double Barn')) },
        { name: 'Side Access', items: activeStep.options.filter(o => o.label.includes('Side Door')) },
        { name: 'Specialty', items: activeStep.options.filter(o => !o.label.includes('Ramp') && !o.label.includes('Double Barn') && !o.label.includes('Side Door')) }
      ];

      return (
        <div className="space-y-12">
          {groups.map(group => group.items.length > 0 && (
            <div key={group.name} className="space-y-4">
              <div className="text-[11px] font-mono font-bold tracking-[1.5px] uppercase pb-3 text-foreground/30 underline decoration-primary underline-offset-8 decoration-2">{group.name}</div>
              {group.items.map((option, i) => (
                <div key={i}>
                  <OptionButton option={option} />
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }

    if (activeStep.id === 'electrical') {
      const packages = activeStep.options.filter(o => o.label.includes('Package'));
      const items = activeStep.options.filter(o => !o.label.includes('Package'));

      return (
        <div className="space-y-12">
          <div className="space-y-6">
            <div className="text-[11px] font-mono font-bold tracking-[1.5px] uppercase pb-3 text-foreground/30 flex items-center space-x-3">
              <div className="w-1 h-1 bg-primary" />
              <span>SYSTEM PACKAGES</span>
            </div>
            {packages.map((option, i) => (
              <div key={i}>
                <OptionButton option={option} />
              </div>
            ))}
          </div>

          <div className="space-y-6 pt-4">
            <div className="text-[11px] font-mono font-bold tracking-[1.5px] uppercase pb-3 text-foreground/30">INDIVIDUAL COMPONENTS</div>
            {items.map((option, i) => (
              <div key={i}>
                <OptionButton option={option} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeStep.id === 'specialty') {
      return (
        <div className="space-y-10">
          <div className="bg-primary text-white p-10 mb-10 relative overflow-hidden group shadow-premium">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Layout size={100} strokeWidth={3} />
            </div>
            <div className="relative z-10">
              <div className="text-[10px] font-mono font-bold tracking-[1.5px] uppercase mb-4 pb-4">CURATED ENV TRANSFORMATION</div>
              <h3 className="text-5xl font-display uppercase leading-[0.85] mb-6">Pro Spec<br />Packages</h3>
              <p className="text-[10px] font-mono leading-relaxed uppercase max-w-[280px] font-bold opacity-70">
                Proprietary bundles designed to scale specific performance archetypes across the technical field.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {activeStep.options.map((option, i) => (
              <div key={i}>
                <OptionButton option={option} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="text-[12px] font-display tracking-widest uppercase pb-2">SPEC_COLLECTION</div>
        {activeStep.options.map((option, i) => (
          <div key={i}>
            <OptionButton option={option} />
          </div>
        ))}
      </div>
    );
  };

  const OptionButton = ({ option }: { option: Option }) => {
    const isSelected = selections[activeStep.id]?.label === option.label;
    const incompatibility = getIncompatibility(activeStep.id, option);

    return (
      <button
        onClick={() => handleSelect(option)}
        disabled={!!incompatibility}
        className={`w-full group text-left border-agency p-6 transition-all relative overflow-hidden ${isSelected
            ? 'bg-primary text-white'
            : incompatibility
              ? 'bg-surface-dim opacity-30 cursor-not-allowed'
              : 'bg-white hover:bg-surface-dim shadow-premium/5'
          }`}
      >
        <div className="flex justify-between items-start relative z-10">
          <div className="flex-1 pr-4">
            <div className="flex items-center space-x-3">
              <span className={`text-[15px] font-mono font-bold tracking-tight uppercase ${isSelected ? 'text-white' : incompatibility ? 'text-foreground/30 line-through' : 'text-foreground'
                }`}>
                {option.label}
              </span>
              {option.note && !incompatibility && (
                <span className={`text-[10px] px-2 py-0.5 border uppercase font-bold tracking-[1.2px] ${isSelected ? 'border-white/40 text-white' : 'border-primary text-primary'}`}>
                  {option.note}
                </span>
              )}
              {incompatibility && (
                <span className="text-[9px] px-2 py-0.5 bg-error text-white font-mono font-bold tracking-[1.2px] uppercase border border-foreground/10">
                  INCOMPATIBLE
                </span>
              )}
            </div>
            {option.detail && (
              <p className={`text-[11px] mt-2 uppercase leading-snug font-mono font-bold ${isSelected ? 'text-white/70' : incompatibility ? 'text-foreground/10' : 'text-foreground/40'}`}>
                {incompatibility || option.detail}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className={`text-[13px] font-mono font-bold ${isSelected ? 'text-white' : 'text-foreground/40'}`}>
              {option.price}
            </div>
            {isSelected && (
              <div className="mt-2 text-white flex justify-end">
                <Check size={18} strokeWidth={3} />
              </div>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="w-full h-[100dvh] relative flex flex-col bg-background overflow-hidden shadow-premium mx-auto">
      {/* Top Header */}
      <nav className="sticky top-0 left-0 w-full h-16 bg-surface-dim flex items-center px-2 md:px-10 z-50 border-b border-white/5 gap-2">
        {/* Left Arrow */}
        <button
          onClick={scrollStepsLeft}
          className="flex items-center justify-center w-8 h-8 text-foreground/60 hover:text-primary transition-colors shrink-0"
        >
          <ChevronLeft size={18} strokeWidth={2} />
        </button>

        {/* Navigation - Horizontal Scrolling on Mobile */}
        <div ref={stepsScrollRef} className="flex-1 overflow-x-auto no-scrollbar flex items-center h-full font-mono min-w-0 gap-0">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActiveStepIndex(i)}
              className={`text-[9px] font-bold tracking-[1.2px] transition-all relative h-full flex items-center px-3 md:px-4 uppercase whitespace-nowrap flex-shrink-0 ${activeStepIndex === i ? 'text-primary' : 'text-foreground hover:text-primary'
                }`}
            >
              <span className="mr-2 opacity-30">{s.num}</span>
              <span className="hidden sm:inline">{s.title}</span>
              <span className="inline sm:hidden">{s.title.split(' ')[0]}</span>
              {activeStepIndex === i && <motion.div layoutId="nav-line" className="absolute bottom-0 left-0 w-full h-[2px] bg-primary" />}
            </button>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={scrollStepsRight}
          className="flex items-center justify-center w-8 h-8 text-foreground/60 hover:text-primary transition-colors shrink-0"
        >
          <ChevronRight size={18} strokeWidth={2} />
        </button>

        <div className="flex items-center space-x-3 md:space-x-6 text-foreground shrink-0 opacity-60">
          <Settings size={16} strokeWidth={2} className="cursor-pointer hover:text-primary transition-colors" />
          <HelpCircle size={16} strokeWidth={2} className="cursor-pointer hover:text-primary transition-colors" />
        </div>
      </nav>

      {/* Main Layout */}
      <main className="flex-1 flex flex-col lg:flex-row relative overflow-hidden pb-16 lg:pb-16">
        {/* Render Stage */}
        <div className="h-[32vh] sm:h-[50vh] md:h-[55vh] lg:h-[calc(100vh-64px)] lg:flex-1 bg-background overflow-hidden flex items-center justify-center border-b lg:border-b-0 lg:border-r border-white/5 order-1 lg:order-1 shrink-0">
          <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:40px_40px]"></div>

          <AnimatePresence mode="wait">
            <motion.div
              key="3d-scene"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-full h-full"
            >
              <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-foreground/20 animate-pulse">CALIBRATING_RENDER_ENGINE...</div>}>
                <TrailerScene
                  length={selectedLength}
                  exteriorColor={selections.exterior?.label || 'Arctic White'}
                />
              </Suspense>
            </motion.div>
          </AnimatePresence>

          {/* <div className="absolute top-4 left-4 md:top-10 md:left-10 space-y-2">
            {activeStep.threeD.map((note, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm px-3 py-1.5 text-[9px] md:text-[10px] font-mono font-bold tracking-[1.2px] uppercase flex items-center space-x-3 shadow-premium/5">
                <Monitor size={14} strokeWidth={2} className="text-primary" />
                <span>{note}</span>
              </div>
            ))}
          </div> */}
        </div>

        {/* Info & Config Sidebar */}
        <aside className="w-full lg:w-[450px] bg-background z-10 flex flex-col order-2 lg:order-2 flex-1 min-h-0 lg:flex-none lg:h-full">
          {/* Step Meta */}
          <div className="p-2 xl:p-8 bg-background/50 backdrop-blur-sm  lg:static top-16  border-b lg:border-b-0 border-white/5">
            <div className="flex justify-between items-start mb-4 md:mb-6">
              <div className="flex flex-col">
                <div className="text-[10px] font-mono font-bold text-foreground/30 tracking-[1.5px] uppercase mb-1 flex items-center">
                  <span className="w-4 h-[1px] bg-foreground/20 mr-2" />
                  STEP {activeStep.num}
                </div>
              </div>
              <div className="px-3 py-1 text-[9px] font-mono font-bold tracking-[1.2px] uppercase bg-primary text-white">
                {activeStep.tag}
              </div>
            </div>
            <div className="flex items-center relative">
              <h2 className="text-sm md:text-sm lg:text-3xl font-display uppercase leading-[0.9] tracking-tight mb-2">{activeStep.title}</h2>
              <div className="ml-3 mb-2 opacity-20 hover:opacity-100 transition-opacity cursor-help relative group/tooltip">
                <HelpCircle size={18} strokeWidth={2.5} />
                <div className="absolute top-full right-0 mt-4 w-72 p-4 bg-white border border-agency shadow-premium text-[11px] font-mono font-bold text-foreground leading-relaxed uppercase hidden group-hover/tooltip:block z-[100] before:content-[''] before:absolute before:bottom-full before:right-1 before:border-8 before:border-transparent before:border-b-white after:content-[''] after:absolute after:bottom-[calc(100%+1px)] after:right-1 after:border-8 after:border-transparent after:border-b-agency">
                  {activeStep.description}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">
            {/* Options */}
            <div className="p-6 xl:p-6 space-y-3">
              {renderOptions()}
            </div>
          </div>

        </aside>
      </main>

      {/* Global Status Unit */}
      <footer className="absolute bottom-0 w-full bg-surface-dim border-t border-white/5 flex flex-row items-center justify-between md:justify-end px-4 md:px-6 py-2 md:py-0 md:h-16 z-50 md:gap-8">
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 order-1 md:order-1">
          <div className="flex flex-col">
            <span className="text-[9px] md:text-[10px] font-mono tracking-[1.2px] uppercase text-foreground/40 font-bold">EST TOTAL</span>
            <span className="text-xl md:text-2xl font-display tracking-tight text-foreground leading-none mt-0.5">
              ${totalPrice.toLocaleString()} <span className="text-[10px] font-mono text-foreground/30 font-bold ml-1 whitespace-nowrap">USD</span>
            </span>
          </div>
          {/* <div className="flex flex-col pl-2 sm:pl-3 border-l border-white/10">
            <span className="text-[9px] md:text-[10px] font-mono tracking-[1.2px] uppercase text-foreground/40 font-bold">CORE</span>
            <span className="text-xl md:text-2xl  font-display font-bold tracking-tight uppercase leading-none mt-1">
              {selections.foundation?.label?.split(' ')[0] || 'UNBOUND'}
            </span>
          </div> */}
        </div>

        <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0 order-2 md:order-2">
          <button
            onClick={prevStep}
            disabled={activeStepIndex === 0}
            className="h-11 md:h-12 border border-agency flex items-center justify-center space-x-1 md:space-x-2 bg-white disabled:opacity-20 hover:shadow-premium transition-all uppercase font-mono font-bold tracking-[1.2px] text-[10px] md:text-[11px] px-4 md:px-5 group"
          >
            <ChevronLeft size={16} strokeWidth={2.5}/>
            <span>BACK</span>
          </button>
          <button
            onClick={nextStep}
            disabled={activeStepIndex === STEPS.length - 1}
            className="h-11 md:h-12 bg-primary text-white border border-agency flex items-center justify-center space-x-1 md:space-x-2 hover:shadow-premium transition-all uppercase font-mono font-bold tracking-[1.2px] text-[10px] md:text-[11px] px-4 md:px-5 group"
          >
            <span>{activeStepIndex === STEPS.length - 1 ? 'FINISH' : 'NEXT'}</span>
            <ChevronRight size={16} strokeWidth={2.5}/>
          </button>
        </div>
      </footer>


      {/* Onboarding Overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 md:p-10"
          >
            <div className="max-w-4xl w-full">
              <div className="text-center mb-10 md:mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-[10px] font-mono font-bold tracking-[3px] text-primary uppercase mb-4"
                >
                  Project Initialization
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-6xl font-display text-white uppercase leading-none tracking-tight"
                >
                  Select Your <br />Starting Point
                </motion.h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => setShowOnboarding(false)}
                  className="group relative bg-white/5 border border-white/10 p-6 md:p-10 text-left hover:bg-white/10 transition-all hover:border-primary/50"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 flex items-center justify-center mb-6 md:mb-8 group-hover:bg-primary group-hover:text-white transition-colors">
                    <Wand2 size={24} strokeWidth={1.5} className="text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-display text-white uppercase mb-4">Build from Scratch</h3>
                  <p className="text-[10px] md:text-[11px] font-mono text-white/40 uppercase leading-relaxed font-bold">
                    Start with a clean slate. Define every parameter of your technical trailer from the ground up.
                  </p>
                  <div className="mt-8 md:mt-10 flex items-center text-[10px] font-mono font-bold tracking-[1.5px] text-primary uppercase">
                    <span>Initialize Clean Build</span>
                    <ChevronRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => {
                    setSelections(prev => ({
                      ...prev,
                      exterior: { label: 'Premium Color: Copper', price: '+$350' },
                      suspension: STEPS[2].options[1],
                      height: HEIGHT_OPTIONS[2]
                    }));
                    setShowOnboarding(false);
                  }}
                  className="group relative bg-white/5 border border-white/10 p-6 md:p-10 text-left hover:bg-white/10 transition-all hover:border-primary/50"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 flex items-center justify-center mb-6 md:mb-8 group-hover:bg-primary group-hover:text-white transition-colors">
                    <Package size={24} strokeWidth={1.5} className="text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-display text-white uppercase mb-4">Pro Presets</h3>
                  <p className="text-[10px] md:text-[11px] font-mono text-white/40 uppercase leading-relaxed font-bold">
                    Choose from our pre-configured technical specs optimized for specific industry work-flows.
                  </p>
                  <div className="mt-8 md:mt-10 flex items-center text-[10px] font-mono font-bold tracking-[1.5px] text-primary uppercase">
                    <span>Load Pre-Configured</span>
                    <ChevronRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>
              </div>

              <div className="mt-10 md:mt-16 text-center">
                <p className="text-[9px] font-mono text-white/20 uppercase tracking-[1.2px] font-bold">
                  All selections can be modified during the configuration protocol
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
